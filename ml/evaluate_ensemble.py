"""Evaluează ansamblul cross-domeniu cu TTA, îl CALIBREAZĂ (temperature scaling)
și raportează metrici PE FIECARE DOMENIU (dermatoscopic / clinic / telefon).

- Predicția ansamblului = media LOGIT-urilor peste modele × 4 augmentări TTA.
- Temperatura T se fitează pe validare (minimizează BCE) → probabilități calibrate.
- Pragul de decizie se alege pe validare (favorizează sensibilitatea).
- Raportul final e pe test, defalcat pe domenii (folosind manifest.csv).

Rulare:
    python evaluate_ensemble.py
"""

import csv
import glob
import json
from pathlib import Path

import torch
import torch.nn as nn
from sklearn.metrics import roc_auc_score, confusion_matrix
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms

HERE = Path(__file__).parent
DATA_DIR = HERE / "data_xdomain"
OUT_DIR = HERE / "artifacts"
MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]

cfg = json.loads((OUT_DIR / "config.json").read_text())
IMG_SIZE = cfg["img_size"]
device = "mps" if torch.backends.mps.is_available() else "cpu"

eval_tf = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(MEAN, STD),
])


def load_models():
    paths = sorted(glob.glob(str(OUT_DIR / "model_*.pt")))
    ms = []
    for p in paths:
        m = models.efficientnet_b3(weights=None)
        m.classifier[1] = nn.Linear(m.classifier[1].in_features, 1)
        m.load_state_dict(torch.load(p, map_location=device))
        m.eval().to(device)
        ms.append(m)
    print(f"Ansamblu: {len(ms)} modele")
    return ms


def _tta(x):
    return [x, torch.flip(x, dims=[3]), torch.flip(x, dims=[2]), torch.rot90(x, 1, dims=[2, 3])]


def domain_map():
    """path relativ (nume fișier) -> domeniu, din manifest.csv."""
    m = {}
    mf = DATA_DIR / "manifest.csv"
    if mf.exists():
        with open(mf) as f:
            for row in csv.DictReader(f):
                m[Path(row["path"]).name] = row["domain"]
    return m


@torch.no_grad()
def predict_logits(ms, split):
    """Întoarce (mean_logits, labels, domains) — logit mediat peste modele×TTA."""
    ds = datasets.ImageFolder(DATA_DIR / split, transform=eval_tf)
    assert ds.classes == ["benign", "malignant"], ds.classes
    loader = DataLoader(ds, batch_size=16, num_workers=6)
    dmap = domain_map()
    domains_by_idx = [dmap.get(Path(p).name, "necunoscut") for p, _ in ds.samples]

    logits, labels = [], []
    for x, y in loader:
        x = x.to(device)
        acc = torch.zeros(x.size(0), device=device)
        n = 0
        for m in ms:
            for v in _tta(x):
                acc += m(v).squeeze(1)
                n += 1
        logits.extend((acc / n).cpu().tolist())
        labels.extend(y.tolist())
    return torch.tensor(logits), torch.tensor(labels, dtype=torch.float), domains_by_idx


def fit_temperature(logits, labels):
    """Fitează un singur scalar T > 0 care minimizează BCE pe validare."""
    T = torch.nn.Parameter(torch.ones(1))
    opt = torch.optim.LBFGS([T], lr=0.05, max_iter=100)
    bce = nn.BCEWithLogitsLoss()

    def closure():
        opt.zero_grad()
        loss = bce(logits / T.clamp(min=1e-2), labels)
        loss.backward()
        return loss

    opt.step(closure)
    return float(T.detach().clamp(min=1e-2).item())


def metrics_at(probs, labels, thr):
    preds = [1 if p >= thr else 0 for p in probs]
    tn, fp, fn, tp = confusion_matrix(labels, preds, labels=[0, 1]).ravel()
    sens = tp / (tp + fn) if (tp + fn) else 0.0
    spec = tn / (tn + fp) if (tn + fp) else 0.0
    acc = (tp + tn) / len(labels)
    return {"acc": round(acc, 4), "sensitivity": round(sens, 4), "specificity": round(spec, 4), "n": len(labels)}


def main():
    ms = load_models()

    vl, vy, _ = predict_logits(ms, "val")
    T = fit_temperature(vl, vy)
    print(f"Temperatură calibrare: {T:.3f}")

    vprobs = torch.sigmoid(vl / T).tolist()
    vlabels = vy.tolist()
    val_auc = roc_auc_score(vlabels, vprobs)
    best_thr, best_score = 0.5, -1
    for i in range(5, 80):
        thr = i / 100
        mm = metrics_at(vprobs, vlabels, thr)
        score = 0.6 * mm["sensitivity"] + 0.4 * mm["specificity"]
        if score > best_score:
            best_score, best_thr = score, thr
    print(f"Prag optim (validare): {best_thr:.2f} | val AUC {val_auc:.4f}")

    tl, ty, tdom = predict_logits(ms, "test")
    tprobs = torch.sigmoid(tl / T).tolist()
    tlabels = ty.tolist()
    test_auc = roc_auc_score(tlabels, tprobs)
    overall = metrics_at(tprobs, tlabels, best_thr)
    print(f"\n=== TEST (ansamblu + TTA + calibrat) ===")
    print(f"  Overall: AUC {test_auc:.4f} | {overall}")

    per_domain = {}
    for dom in sorted(set(tdom)):
        idx = [i for i, d in enumerate(tdom) if d == dom]
        if len(idx) < 5:
            continue
        dp = [tprobs[i] for i in idx]
        dl = [tlabels[i] for i in idx]
        dm = metrics_at(dp, dl, best_thr)
        auc = roc_auc_score(dl, dp) if len(set(dl)) > 1 else float("nan")
        per_domain[dom] = {"auc": round(auc, 4), **dm}
        print(f"  [{dom}]: AUC {auc:.4f} | {dm}")

    cfg.update({"threshold": best_thr, "temperature": round(T, 4)})
    (OUT_DIR / "config.json").write_text(json.dumps(cfg))
    (OUT_DIR / "metrics_xdomain.json").write_text(json.dumps({
        "temperature": T, "threshold": best_thr, "val_auc": val_auc,
        "test_auc": test_auc, "overall": overall, "per_domain": per_domain,
    }, indent=2))
    print(f"\nSalvat: config.json (prag {best_thr:.2f}, T {T:.3f}) + metrics_xdomain.json")


if __name__ == "__main__":
    main()
