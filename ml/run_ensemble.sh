#!/usr/bin/env bash
# Orchestrare completă a ansamblului — rulează independent de sesiunea Claude.
# Așteaptă model_0 (deja în antrenare), antrenează model_1, evaluează ansamblul,
# apoi repornește serverul de inferență cu ansamblul final.
set -u
cd "$(dirname "$0")"
PY=.venv/bin/python
LOG() { echo "[$(date '+%H:%M:%S')] $*"; }

export PYTORCH_ENABLE_MPS_FALLBACK=1

# 1) Așteaptă ca model_0 să termine (scrie metrics_0.json la final)
LOG "Aștept finalizarea model_0..."
until [ -f artifacts/metrics_0.json ]; do sleep 10; done
LOG "model_0 gata."

# 2) Antrenează model_1 (alt seed) dacă nu există deja
if [ ! -f artifacts/metrics_1.json ]; then
  LOG "Antrenez model_1 (seed 1)..."
  $PY -u train.py --tag 1 --seed 1 --epochs 16 --freeze-epochs 3 > train_m1.log 2>&1
  LOG "model_1 gata."
else
  LOG "model_1 există deja, sar peste."
fi

# 3) Evaluează ansamblul + alege pragul optim (scrie config.json + metrics_ensemble.json)
LOG "Evaluez ansamblul cu TTA..."
$PY -u evaluate_ensemble.py > eval_ensemble.log 2>&1
LOG "Evaluare gata."

# 4) Repornește serverul de inferență cu ansamblul final
LOG "Repornesc serverul de inferență..."
pkill -f "uvicorn server:app" 2>/dev/null
sleep 2
nohup .venv/bin/uvicorn server:app --host 127.0.0.1 --port 8000 > server.log 2>&1 &
sleep 5
LOG "Health: $(curl -s http://127.0.0.1:8000/api/health)"
LOG "TERMINAT. Rezultate în artifacts/metrics_ensemble.json"
