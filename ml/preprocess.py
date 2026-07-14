from __future__ import annotations

import cv2
import numpy as np
from PIL import Image

def shades_of_gray(bgr: np.ndarray, power: int = 6) -> np.ndarray:
    img = bgr.astype(np.float32)
    flat = img.reshape(-1, 3)

    norm = np.power(np.mean(np.power(flat, power), axis=0), 1.0 / power)
    norm = np.where(norm == 0, 1.0, norm)
    gain = norm.mean() / norm
    out = img * gain.reshape(1, 1, 3)
    return np.clip(out, 0, 255).astype(np.uint8)

def remove_hair(bgr: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17))
    blackhat = cv2.morphologyEx(gray, cv2.MORPH_BLACKHAT, kernel)
    _, mask = cv2.threshold(blackhat, 10, 255, cv2.THRESH_BINARY)

    if mask.mean() < 1.0:
        return bgr
    mask = cv2.dilate(mask, np.ones((3, 3), np.uint8), iterations=1)
    return cv2.inpaint(bgr, mask, 1, cv2.INPAINT_TELEA)

def apply(
    img: Image.Image, do_hair: bool = True, do_color: bool = True, max_size: int = 384
) -> Image.Image:
    img = img.convert("RGB")

    if max_size and max(img.size) > max_size:
        scale = max_size / max(img.size)
        img = img.resize((round(img.size[0] * scale), round(img.size[1] * scale)))
    bgr = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    if do_hair:
        bgr = remove_hair(bgr)
    if do_color:
        bgr = shades_of_gray(bgr)
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    return Image.fromarray(rgb)

if __name__ == "__main__":
    import sys

    for p in sys.argv[1:]:
        out = apply(Image.open(p))
        dst = p.rsplit(".", 1)[0] + "_prep.png"
        out.save(dst)
        print("scris", dst)
