import argparse
import io
import json
import random
from pathlib import Path

import torch
import torch.nn as nn
from PIL import Image
from sklearn.metrics import roc_auc_score, confusion_matrix
from torch.utils.data import DataLoader, WeightedRandomSampler
from torchvision import datasets, models, transforms

HERE = Path(__file__).parent
DATA_DIR = HERE / "data_xdomain"
OUT_DIR = HERE / "artifacts"


class RandomJPEG:
    """Recomprimă imaginea ca JPEG cu calitate variabilă — simulează artefactele
    de compresie ale pozelor de pe telefon/WhatsApp."""

    def __init__(self, p: float = 0.4, q_range=(30, 75)):
        self.p, self.q_range = p, q_range

    def __call__(self, img: Image.Image) -> Image.Image:
        if random.random() > self.p:
            return img
        buf = io.BytesIO()
        img.convert("RGB").save(buf, format="JPEG", quality=random.randint(*self.q_range))
        buf.seek(0)
        return Image.open(buf).convert("RGB")


class RandomDownscale:
    """Reduce rezoluția apoi o mărește la loc — simulează poze de telefon mici
    sau făcute de la distanță."""

    def __init__(self, p: float = 0.3, min_scale: float = 0.4):
        self.p, self.min_scale = p, min_scale

    def __call__(self, img: Image.Image) -> Image.Image:
        if random.random() > self.p:
            return img
        w, h = img.size
        s = random.uniform(self.min_scale, 1.0)
        small = img.resize((max(1, int(w * s)), max(1, int(h * s))))
        return small.resize((w, h))
IMG_SIZE = 300
CLASS_NAMES = ["benign", "malignant"]
LABEL_SMOOTH = 0.05

MEAN = [0.485, 0.456, 0.406]
STD = [0.229, 0.224, 0.225]


def build_transforms():
    train_tf = transforms.Compose([

        RandomDownscale(p=0.3, min_scale=0.4),
        RandomJPEG(p=0.4, q_range=(30, 75)),
        transforms.Resize((IMG_SIZE + 40, IMG_SIZE + 40)),
        transforms.RandomResizedCrop(IMG_SIZE, scale=(0.65, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(30),
        transforms.RandomApply([transforms.GaussianBlur(5, sigma=(0.2, 2.0))], p=0.3),

        transforms.ColorJitter(brightness=0.25, contrast=0.25, saturation=0.2, hue=0.03),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
        transforms.RandomErasing(p=0.25, scale=(0.02, 0.12)),
    ])
    eval_tf = transforms.Compose([
        transforms.Resize((IMG_SIZE, IMG_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize(MEAN, STD),
    ])
    return train_tf, eval_tf


def make_loaders(batch_size: int):
    train_tf, eval_tf = build_transforms()
    train_ds = datasets.ImageFolder(DATA_DIR / "train", transform=train_tf)
    val_ds = datasets.ImageFolder(DATA_DIR / "val", transform=eval_tf)
    test_ds = datasets.ImageFolder(DATA_DIR / "test", transform=eval_tf)
    assert train_ds.classes == CLASS_NAMES, train_ds.classes

    targets = [y for _, y in train_ds.samples]
    class_count = [targets.count(0), targets.count(1)]
    weights = [1.0 / class_count[y] for y in targets]
    sampler = WeightedRandomSampler(weights, num_samples=len(weights), replacement=True)

    train_loader = DataLoader(train_ds, batch_size=batch_size, sampler=sampler, num_workers=6)
    val_loader = DataLoader(val_ds, batch_size=batch_size, num_workers=6)
    test_loader = DataLoader(test_ds, batch_size=batch_size, num_workers=6)
    return train_loader, val_loader, test_loader, class_count


def build_model() -> nn.Module:
    model = models.efficientnet_b3(weights=models.EfficientNet_B3_Weights.IMAGENET1K_V1)
    in_feat = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_feat, 1)
    return model


def set_backbone_trainable(model: nn.Module, trainable: bool) -> None:
    for name, p in model.named_parameters():
        if not name.startswith("classifier"):
            p.requires_grad = trainable



def _tta_views(x: torch.Tensor):
    yield x
    yield torch.flip(x, dims=[3])
    yield torch.flip(x, dims=[2])
    yield torch.rot90(x, k=1, dims=[2, 3])


@torch.no_grad()
def evaluate(model, loader, device, tta: bool = True):
    model.eval()
    probs, labels = [], []
    for x, y in loader:
        x = x.to(device)
        views = list(_tta_views(x)) if tta else [x]
        p = torch.zeros(x.size(0), device=device)
        for v in views:
            p += torch.sigmoid(model(v).squeeze(1))
        p /= len(views)
        probs.extend(p.cpu().tolist())
        labels.extend(y.tolist())
    auc = roc_auc_score(labels, probs) if len(set(labels)) > 1 else float("nan")
    preds = [1 if p >= 0.5 else 0 for p in probs]
    tn, fp, fn, tp = confusion_matrix(labels, preds, labels=[0, 1]).ravel()
    sens = tp / (tp + fn) if (tp + fn) else 0.0
    spec = tn / (tn + fp) if (tn + fp) else 0.0
    acc = (tp + tn) / len(labels)
    return {"auc": auc, "acc": acc, "sensitivity": sens, "specificity": spec}


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--tag", default="0", help="sufix pentru numele modelului (ansamblu)")
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--epochs", type=int, default=18)
    ap.add_argument("--freeze-epochs", type=int, default=3, help="epoci cu backbone înghețat")
    ap.add_argument("--batch-size", type=int, default=16)
    ap.add_argument("--lr", type=float, default=3e-4)
    args = ap.parse_args()

    torch.manual_seed(args.seed)
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    print(f"Device: {device} | model tag: {args.tag} | seed: {args.seed}")

    train_loader, val_loader, test_loader, class_count = make_loaders(args.batch_size)
    print(f"Distribuție train benign/malignant: {class_count}")

    model = build_model().to(device)
    pos_weight = torch.tensor([class_count[0] / max(class_count[1], 1)], device=device)
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weight)

    OUT_DIR.mkdir(exist_ok=True)
    best_auc = -1.0
    best_path = OUT_DIR / f"model_{args.tag}.pt"


    set_backbone_trainable(model, False)
    optimizer = torch.optim.AdamW(
        [p for p in model.parameters() if p.requires_grad], lr=1e-3, weight_decay=1e-4
    )

    total_epochs = args.epochs
    for epoch in range(1, total_epochs + 1):
        if epoch == args.freeze_epochs + 1:

            set_backbone_trainable(model, True)
            optimizer = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
            scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
                optimizer, T_max=total_epochs - args.freeze_epochs
            )
        model.train()
        running = 0.0
        for x, y in train_loader:
            x = x.to(device)

            y = y.float().to(device)
            y = y * (1 - LABEL_SMOOTH) + (1 - y) * LABEL_SMOOTH
            optimizer.zero_grad()
            logit = model(x).squeeze(1)
            loss = criterion(logit, y)
            loss.backward()
            optimizer.step()
            running += loss.item() * x.size(0)
        if epoch > args.freeze_epochs:
            scheduler.step()
        train_loss = running / len(train_loader.dataset)
        val = evaluate(model, val_loader, device)
        phase = "cap" if epoch <= args.freeze_epochs else "full"
        print(
            f"Epoch {epoch:2d}/{total_epochs} [{phase}] | loss {train_loss:.4f} | "
            f"val AUC {val['auc']:.4f} sens {val['sensitivity']:.3f} "
            f"spec {val['specificity']:.3f} acc {val['acc']:.3f}"
        )
        if val["auc"] > best_auc:
            best_auc = val["auc"]
            torch.save(model.state_dict(), best_path)


    (OUT_DIR / "config.json").write_text(
        json.dumps({"arch": "efficientnet_b3", "img_size": IMG_SIZE, "classes": CLASS_NAMES})
    )

    model.load_state_dict(torch.load(best_path, map_location=device))
    test = evaluate(model, test_loader, device)
    print(f"\n=== TEST (model {args.tag}, cu TTA) ===")
    for k, v in test.items():
        print(f"  {k}: {v:.4f}")
    (OUT_DIR / f"metrics_{args.tag}.json").write_text(
        json.dumps({"val_best_auc": best_auc, "test": test}, indent=2)
    )


if __name__ == "__main__":
    main()
