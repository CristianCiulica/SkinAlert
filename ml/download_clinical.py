"""Descarcă subsetul CLINIC (cameră reală, non-dermatoscopic) din ISIC Archive.

Aceste imagini sunt mai apropiate de pozele de telefon decât cele dermatoscopice.
Se salvează separat în data_clinical/{benign,malignant}/ (fără split — splitul
pe pacient/domeniu se face ulterior în build_dataset.py).

Rulare:
    python download_clinical.py --per-class 4500
"""

import argparse
import concurrent.futures as cf
import time
from pathlib import Path

import requests

API = "https://api.isic-archive.com/api/v2/images/search/"
OUT = Path(__file__).parent / "data_clinical"
CLASSES = {
    "benign": "image_type:clinical AND diagnosis_1:Benign",
    "malignant": "image_type:clinical AND diagnosis_1:Malignant",
}


def fetch_list(query: str, target: int) -> list[dict]:
    out, url, params = [], API, {"query": query, "limit": 100}
    while url and len(out) < target:
        r = requests.get(url, params=params, timeout=30)
        r.raise_for_status()
        p = r.json()
        for it in p.get("results", []):
            full = (it.get("files") or {}).get("full") or {}
            if full.get("url"):
                out.append({"id": it["isic_id"], "url": full["url"]})
        url, params = p.get("next"), None
        time.sleep(0.15)
    return out[:target]


def dl(item: dict, dest: Path) -> bool:
    path = dest / f"{item['id']}.jpg"
    if path.exists():
        return True
    try:
        r = requests.get(item["url"], timeout=60)
        r.raise_for_status()
        path.write_bytes(r.content)
        return True
    except Exception as e:                
        print(f"  ! {item['id']}: {e}")
        return False


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-class", type=int, default=4500)
    ap.add_argument("--workers", type=int, default=16)
    args = ap.parse_args()
    for cls, query in CLASSES.items():
        dest = OUT / cls
        dest.mkdir(parents=True, exist_ok=True)
        print(f"=== {cls}: listez...")
        items = fetch_list(query, args.per_class)
        print(f"=== {cls}: descarc {len(items)} imagini")
        ok = 0
        with cf.ThreadPoolExecutor(max_workers=args.workers) as ex:
            for r in ex.map(lambda it: dl(it, dest), items):
                ok += bool(r)
        print(f"=== {cls}: {ok}/{len(items)} salvate în {dest}")
    print("Gata clinical.")


if __name__ == "__main__":
    main()
