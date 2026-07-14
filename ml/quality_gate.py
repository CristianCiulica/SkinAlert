"""Poartă de calitate a imaginii — filtrează pozele nepotrivite ÎNAINTE de model,
ca să nu dăm predicții pe input de proastă calitate.

Verifică: claritate (blur), luminozitate și contrast. Toate metricile se
calculează pe imaginea redimensionată la 300x300 (invariant la rezoluție și
identic cu intrarea modelului). Pragurile sunt setate sub percentila 1-3 a
imaginilor bune (dermatoscopice + clinice ISIC), deci poarta respinge doar
pozele clar problematice — nu cazurile de graniță (evităm respingeri false).

Verdictul vine cu mesaje acționabile în română.
"""

from __future__ import annotations

from dataclasses import dataclass, field

import cv2
import numpy as np
from PIL import Image

WORK_SIZE = 300

BLUR_MIN = 15.0                                                             
DARK_MIN = 55.0                                                           
BRIGHT_MAX = 242.0                            
CONTRAST_MIN = 8.0                                                             


@dataclass
class QualityReport:
    ok: bool
    issues: list[str] = field(default_factory=list)
    metrics: dict = field(default_factory=dict)


def _gray_300(img: Image.Image) -> np.ndarray:
    im = img.convert("RGB").resize((WORK_SIZE, WORK_SIZE))
    return cv2.cvtColor(np.array(im), cv2.COLOR_RGB2GRAY)


def assess(img: Image.Image) -> QualityReport:
    gray = _gray_300(img)
    blur = float(cv2.Laplacian(gray, cv2.CV_64F).var())
    brightness = float(gray.mean())
    contrast = float(gray.std())

    metrics = {
        "blur": round(blur, 1),
        "brightness": round(brightness, 1),
        "contrast": round(contrast, 1),
    }
    issues: list[str] = []
    if blur < BLUR_MIN:
        issues.append("Poza pare neclară. Ține telefonul stabil și focalizează pe aluniță.")
    if brightness < DARK_MIN:
        issues.append("Poza e prea întunecată. Mută-te într-un loc cu mai multă lumină.")
    if brightness > BRIGHT_MAX:
        issues.append("Poza e supraexpusă (prea mult blitz/reflexie). Evită lumina directă.")
    if contrast < CONTRAST_MIN:
        issues.append("Cadrul are prea puțin detaliu. Apropie-te și încadrează clar leziunea.")

    return QualityReport(ok=len(issues) == 0, issues=issues, metrics=metrics)


if __name__ == "__main__":
    import sys

    for p in sys.argv[1:]:
        r = assess(Image.open(p))
        print(f"{p}: ok={r.ok} {r.metrics}")
        for i in r.issues:
            print("   -", i)
