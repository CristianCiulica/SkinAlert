"""Exportă ensemble-ul EfficientNet-B3 în ONNX pentru inferență în browser.

Rulează: .venv/bin/python export_onnx.py
Scrie fișierele în ../public/models/.
"""
from __future__ import annotations

import glob
import json
from pathlib import Path

import torch
import torch.nn as nn
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
    out = OUT / f"model_{i}.onnx"
    torch.onnx.export(
        m,
        dummy,
        str(out),
        input_names=["input"],
        output_names=["logit"],
        opset_version=17,
        dynamo=False,
    )
    size_mb = out.stat().st_size / 1e6
    print(f"exportat {out.name}: {size_mb:.1f} MB")

print("gata")
