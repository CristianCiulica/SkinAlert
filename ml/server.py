"""API de inferență FastAPI pentru clasificarea leziunilor cutanate.

Pipeline complet, robust la poze de telefon:
  1. Poartă de calitate — respinge pozele neclare/întunecate cu mesaje utile.
  2. Preprocesare — îndepărtare păr + constanță de culoare (identic cu antrenarea).
  3. Ansamblu B3 + TTA — media logit-urilor peste modele × augmentări.
  4. Calibrare — temperature scaling (probabilități oneste).

Rulare:
    uvicorn server:app --host 0.0.0.0 --port 8000
"""

from __future__ import annotations

import glob
import io
import json
from pathlib import Path

import torch
import torch.nn as nn
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import models, transforms

import preprocess as pp
from quality_gate import assess

HERE = Path(__file__).parent
ARTIFACTS = HERE / "artifacts"
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]

_cfg = json.loads((ARTIFACTS / "config.json").read_text())
IMG_SIZE = _cfg.get("img_size", 300)
ARCH = _cfg.get("arch", "efficientnet_b3")
DECISION_THRESHOLD = _cfg.get("threshold", 0.40)
TEMPERATURE = _cfg.get("temperature", 1.0)

device = "mps" if torch.backends.mps.is_available() else "cpu"

transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])


def _build(arch: str) -> nn.Module:
    m = getattr(models, arch)(weights=None)
    m.classifier[1] = nn.Linear(m.classifier[1].in_features, 1)
    return m


def load_ensemble() -> list[nn.Module]:
    paths = sorted(glob.glob(str(ARTIFACTS / "model_*.pt")))
    if not paths:
        raise RuntimeError("Nu am găsit modele antrenate (artifacts/model_*.pt).")
    ens = []
    for p in paths:
        m = _build(ARCH)
        m.load_state_dict(torch.load(p, map_location=device))
        m.eval().to(device)
        ens.append(m)
    return ens


def _tta(x: torch.Tensor):
    return [x, torch.flip(x, dims=[3]), torch.flip(x, dims=[2]), torch.rot90(x, 1, dims=[2, 3])]


app = FastAPI(title="SkinAlert Inference API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_ensemble: list[nn.Module] | None = None


def get_ensemble() -> list[nn.Module]:
    global _ensemble
    if _ensemble is None:
        _ensemble = load_ensemble()
    return _ensemble


@app.get("/api/health")
def health() -> dict:
    n = len(glob.glob(str(ARTIFACTS / "model_*.pt")))
    return {
        "status": "ok" if n else "model_missing",
        "device": device, "models": n, "arch": ARCH,
        "threshold": DECISION_THRESHOLD, "temperature": TEMPERATURE,
    }


@app.post("/api/analyze")
async def analyze(image: UploadFile = File(...)) -> dict:
    if image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
        raise HTTPException(400, "Format de imagine neacceptat (folosește JPEG/PNG/WebP).")
    raw = await image.read()
    try:
        img = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception:
        raise HTTPException(400, "Nu am putut citi imaginea.")


    q = assess(img)
    if not q.ok:
        return {
            "status": "low_quality",
            "quality_issues": q.issues,
            "quality_metrics": q.metrics,
            "message": "Imaginea nu e suficient de bună pentru o analiză fiabilă.",
            "disclaimer": "Acest rezultat este orientativ și NU constituie un diagnostic medical.",
        }


    proc = pp.apply(img)


    x = transform(proc).unsqueeze(0).to(device)
    with torch.no_grad():
        total, n = 0.0, 0
        for m in get_ensemble():
            for v in _tta(x):
                total += m(v).squeeze(1).item()
                n += 1
        mean_logit = total / n
        prob_malignant = torch.sigmoid(torch.tensor(mean_logit / TEMPERATURE)).item()

    is_suspect = prob_malignant >= DECISION_THRESHOLD
    return {
        "status": "ok",
        "probability_malignant": round(prob_malignant, 4),
        "label": "suspect" if is_suspect else "benign",
        "confidence": round(prob_malignant if is_suspect else 1 - prob_malignant, 4),
        "threshold": round(DECISION_THRESHOLD, 4),
        "quality_metrics": q.metrics,
        "recommendation": (
            "Leziunea prezintă caracteristici care justifică un consult dermatologic. "
            "Programează o evaluare de specialitate."
            if is_suspect
            else "Leziunea pare benignă. Continuă monitorizarea periodică și consultă "
            "un medic dacă observi modificări."
        ),
        "disclaimer": "Acest rezultat este orientativ și NU constituie un diagnostic medical.",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
