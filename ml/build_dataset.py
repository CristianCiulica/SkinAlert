from __future__ import annotations

import argparse
import concurrent.futures as cf
import csv
import hashlib
from pathlib import Path

from PIL import Image

import preprocess as pp

HERE = Path(__file__).parent
OUT = HERE / "data_xdomain"
SPLITS = ("train", "val", "test")
PAD_MALIGNANT = {"BCC", "MEL", "SCC"}
PAD_BENIGN = {"ACK", "NEV", "SEK"}

def split_for(key: str) -> str:
    h = int(hashlib.md5(key.encode()).hexdigest(), 16) % 100
    if h < 70:
        return "train"
    if h < 85:
        return "val"
    return "test"

def collect_dermato() -> list[tuple[Path, str, str, str]]:
    items = []
    for split in SPLITS:
        for cls in ("benign", "malignant"):
            d = HERE / "data" / split / cls
            if d.exists():
                for p in d.glob("*.jpg"):
                    items.append((p, cls, split, "dermato"))
    return items

def collect_clinical() -> list[tuple[Path, str, str, str]]:
    items = []
    for cls in ("benign", "malignant"):
        d = HERE / "data_clinical" / cls
        if d.exists():
            for p in d.glob("*.jpg"):
                items.append((p, cls, split_for("clin_" + p.stem), "clinic"))
    return items

def collect_phone() -> list[tuple[Path, str, str, str]]:
    meta = HERE / "pad_metadata.csv"
    imgdir = HERE / "data_phone" / "images"
    if not (meta.exists() and imgdir.exists()):
        return []
    items = []
    with open(meta) as f:
        for row in csv.DictReader(f):
            diag = row["diagnostic"].strip().upper()
            cls = "malignant" if diag in PAD_MALIGNANT else "benign" if diag in PAD_BENIGN else None
            if cls is None:
                continue
            img = imgdir / row["img_id"]
            if img.exists():

                items.append((img, cls, split_for("pat_" + row["patient_id"]), "telefon"))
    return items

def process_one(item) -> tuple[str, str, str] | None:
    src, cls, split, domain = item
    dst_dir = OUT / split / cls
    dst = dst_dir / f"{domain}_{src.stem}.png"
    if dst.exists():
        return (str(dst), domain, cls)
    try:
        out = pp.apply(Image.open(src))
        dst_dir.mkdir(parents=True, exist_ok=True)
        out.save(dst)
        return (str(dst.relative_to(HERE)), domain, cls)
    except Exception as e:                
        print(f"  ! {src.name}: {e}")
        return None

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--workers", type=int, default=8)
    args = ap.parse_args()

    items = collect_dermato() + collect_clinical() + collect_phone()
    by_domain: dict[str, int] = {}
    for _, _, _, dom in items:
        by_domain[dom] = by_domain.get(dom, 0) + 1
    print(f"Total imagini: {len(items)} | pe domenii: {by_domain}")

    OUT.mkdir(exist_ok=True)
    manifest = OUT / "manifest.csv"
    done = 0
    with open(manifest, "w", newline="") as mf:
        w = csv.writer(mf)
        w.writerow(["path", "domain", "class"])
        with cf.ThreadPoolExecutor(max_workers=args.workers) as ex:
            for res in ex.map(process_one, items):
                if res:
                    w.writerow(res)
                    done += 1
                    if done % 2000 == 0:
                        print(f"  procesate {done}/{len(items)}")

    print(f"\nProcesate: {done}")
    for split in SPLITS:
        for cls in ("benign", "malignant"):
            d = OUT / split / cls
            n = len(list(d.glob("*.png"))) if d.exists() else 0
            print(f"  {split}/{cls}: {n}")
    print(f"\nManifest: {manifest}")

if __name__ == "__main__":
    main()
