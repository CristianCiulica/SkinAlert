"""Exportă ensemble-ul EfficientNet-B3 în ONNX fp16 pentru inferență în browser.

Ambele modele sunt exportate (browserul rulează ensemble + TTA, identic cu
serverul original). Greutățile sunt convertite la fp16 (jumătate de mărime,
diferență de probabilitate măsurată ~3e-4), dar input/output rămân fp32
(keep_io_types) ca JS-ul să lucreze cu Float32Array.

Rulează: .venv/bin/python export_onnx.py
Scrie fișierele în ../public/models/.
"""
from __future__ import annotations

import glob
import json
from pathlib import Path

import onnx
import torch
import torch.nn as nn
from onnxconverter_common import float16
from torchvision import models

HERE = Path(__file__).parent
ARTIFACTS = HERE / "artifacts"
OUT = HERE.parent / "public" / "models"
OUT.mkdir(parents=True, exist_ok=True)

cfg = json.loads((ARTIFACTS / "config.json").read_text())
ARCH = cfg.get("arch", "efficientnet_b3")
IMG = cfg.get("img_size", 300)


def build(arch: str) -> nn.Module:
    m = getattr(models, arch)(weights=None)
    m.classifier[1] = nn.Linear(m.classifier[1].in_features, 1)
    return m


paths = sorted(glob.glob(str(ARTIFACTS / "model_*.pt")))
dummy = torch.randn(1, 3, IMG, IMG)

for i, p in enumerate(paths):
    m = build(ARCH)
    m.load_state_dict(torch.load(p, map_location="cpu"))
    m.eval()

    tmp = OUT / f"tmp_model_{i}.onnx"
    torch.onnx.export(
        m,
        dummy,
        str(tmp),
        input_names=["input"],
        output_names=["logit"],
        opset_version=17,
        dynamo=False,
    )
    mdl16 = float16.convert_float_to_float16(onnx.load(str(tmp)), keep_io_types=True)
    out = OUT / f"skin-model-{i}.fp16.onnx"
    onnx.save(mdl16, str(out))
    tmp.unlink()
    print(f"exportat {out.name}: {out.stat().st_size / 1e6:.1f} MB")

print("gata")
