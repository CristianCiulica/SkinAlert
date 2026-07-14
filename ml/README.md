# SkinAlert — Modelul AI

Clasificator binar de leziuni cutanate: **benign** vs **suspect (malign)**, robust
atât la imagini **dermatoscopice** cât și la **poze de tip telefon / cameră**.
Ansamblu de 2 modele **EfficientNet-B3** (300px), transfer learning pe ~15.700
imagini cross-domeniu din [ISIC Archive](https://www.isic-archive.com/) (dermatoscopic
+ clinic), cu preprocesare, poartă de calitate, Test-Time Augmentation și calibrare.

## Pipeline de inferență (server.py)

1. **Poartă de calitate** — respinge pozele neclare/întunecate cu mesaje utile.
2. **Preprocesare** — îndepărtare păr (DullRazor) + constanță de culoare (Shades-of-Gray).
3. **Ansamblu B3 + TTA** — media logit-urilor peste 2 modele × 4 augmentări.
4. **Calibrare** — temperature scaling (T=0.79) pentru probabilități oneste.

## Rezultate pe test (2.359 imagini nevăzute), defalcate pe domeniu

| Domeniu | AUC | Sensibilitate | Specificitate |
|---------|-----|---------------|---------------|
| **Dermatoscopic** | 0.993 | 97.3% | 96.0% |
| **Clinic (proxy telefon)** | 0.921 | 91.4% | 76.0% |
| Overall | 0.968 | 94.2% | 87.2% |

Pragul (0.23) e ales pe validare, favorizând puternic sensibilitatea (mai bine o
alarmă falsă decât un melanom ratat). Cifrele pe domeniul clinic sunt mai mici —
onest — pentru că pozele de cameră sunt intrinsec mai grele decât cele dermatoscopice.
Modelul dermatoscopic anterior e păstrat în `artifacts_dermato/`.

## Structură

| Fișier | Rol |
|--------|-----|
| `download_data.py` | Descarcă imaginile ISIC și le împarte în train/val/test |
| `train.py` | Antrenează modelul, salvează cel mai bun după AUC pe validare |
| `server.py` | API FastAPI de inferență (`POST /api/analyze`) |
| `artifacts/` | Modelul antrenat (`model.pt`), etichete și metrici |
| `data/` | Datasetul descărcat (`{train,val,test}/{benign,malignant}/`) |

## Cum se rulează de la zero

```bash
# 1. Mediu
python3 -m venv .venv
.venv/bin/pip install torch torchvision fastapi "uvicorn[standard]" pillow scikit-learn requests python-multipart

# 2. Date (~8000 imagini)
.venv/bin/python download_data.py --per-class 4000

# 3. Antrenare ansamblu (Apple Silicon: MPS) — 2 modele cu seed diferit
.venv/bin/python train.py --tag 0 --seed 0 --epochs 16
.venv/bin/python train.py --tag 1 --seed 1 --epochs 16

# 4. Evaluare ansamblu + alegere prag optim (scrie config.json)
.venv/bin/python evaluate_ensemble.py

# 5. Server de inferență (ansamblu + TTA)
.venv/bin/uvicorn server:app --port 8000
```

Sau tot lanțul dintr-o comandă: `bash run_ensemble.sh` (presupune că model_0
e deja pornit; vezi scriptul).

Frontend-ul Angular apelează `http://localhost:8000/api/analyze` din
`src/app/core/analyzer.service.ts`.

## Detalii de model

- **Arhitectură:** EfficientNet-B0 cu un cap liniar de 1 neuron (sigmoid).
- **Dezechilibru de clase:** tratat dublu — `WeightedRandomSampler` + `pos_weight`
  în `BCEWithLogitsLoss`.
- **Augmentare:** flip orizontal/vertical, rotații, jitter de luminozitate/contrast.
- **Prag de decizie:** `0.40` (sub 0.5, ca să favorizăm sensibilitatea — un fals
  negativ, adică un melanom ratat, e mai grav decât o alarmă falsă).
- **Metrici raportate:** AUC, acuratețe, **sensibilitate** (recall pe malign) și
  specificitate — vezi `artifacts/metrics.json`.

## Important — context medical

Acest model este un **instrument educativ / de screening orientativ**, NU un
dispozitiv medical certificat și NU pune diagnostic. Orice leziune suspectă
trebuie evaluată de un medic dermatolog. Datasetul public ISIC conține
preponderent piele deschisă la culoare; performanța pe tonuri închise trebuie
validată separat înainte de orice utilizare reală.
