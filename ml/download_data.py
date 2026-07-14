import argparse
import concurrent.futures as cf
import random
import time
from pathlib import Path

import requests

API = "https://api.isic-archive.com/api/v2/images/search/"
DATA_DIR = Path(__file__).parent / "data"
SPLITS = {"train": 0.7, "val": 0.15, "test": 0.15}
CLASSES = {"benign": "diagnosis_1:Benign", "malignant": "diagnosis_1:Malignant"}

def fetch_image_list(query: str, target: int) -> list[dict]:
    out: list[dict] = []
    url = API
    params = {"query": query, "limit": 100}
    while url and len(out) < target:
        resp = requests.get(url, params=params, timeout=30)
        resp.raise_for_status()
        payload = resp.json()
        for r in payload.get("results", []):
            full = (r.get("files") or {}).get("full") or {}
            if full.get("url"):
                out.append({"isic_id": r["isic_id"], "url": full["url"]})
        url = payload.get("next")
        params = None                                         
        time.sleep(0.2)
    return out[:target]

def download_one(item: dict, dest: Path) -> bool:
    path = dest / f"{item['isic_id']}.jpg"
    if path.exists():
        return True
    try:
        r = requests.get(item["url"], timeout=60)
        r.raise_for_status()
        path.write_bytes(r.content)
        return True
    except Exception as e:                
        print(f"  ! eșec {item['isic_id']}: {e}")
        return False

def split_items(items: list[dict]) -> dict[str, list[dict]]:
    random.shuffle(items)
    n = len(items)
    n_train = int(n * SPLITS["train"])
    n_val = int(n * SPLITS["val"])
    return {
        "train": items[:n_train],
        "val": items[n_train : n_train + n_val],
        "test": items[n_train + n_val :],
    }

def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--per-class", type=int, default=1500)
    ap.add_argument("--workers", type=int, default=12)
    args = ap.parse_args()
    random.seed(42)

    for cls, query in CLASSES.items():
        print(f"\n=== {cls} ===")
        print("  listez imagini disponibile...")
        items = fetch_image_list(query, args.per_class)
        print(f"  {len(items)} imagini de descărcat")
        splits = split_items(items)
        for split, split_items_ in splits.items():
            dest = DATA_DIR / split / cls
            dest.mkdir(parents=True, exist_ok=True)
            ok = 0
            with cf.ThreadPoolExecutor(max_workers=args.workers) as ex:
                for r in ex.map(lambda it: download_one(it, dest), split_items_):
                    ok += bool(r)
            print(f"  {split}: {ok}/{len(split_items_)} salvate în {dest}")

    print("\nGata. Structura datasetului este în ml/data/{train,val,test}/{benign,malignant}/")

if __name__ == "__main__":
    main()
