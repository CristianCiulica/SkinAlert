#!/usr/bin/env bash
# Reantrenare cross-domeniu completă, independentă de sesiunea Claude.
# Antrenează 2 modele B3 pe data_xdomain, calibrează + evaluează pe domenii,
# apoi repornește serverul de inferență.
set -u
cd "$(dirname "$0")"
PY=.venv/bin/python
LOG() { echo "[$(date '+%H:%M:%S')] $*"; }
export PYTORCH_ENABLE_MPS_FALLBACK=1

EPOCHS=14

LOG "Antrenez model_0 (xdomain)..."
$PY -u train.py --tag 0 --seed 0 --epochs $EPOCHS --freeze-epochs 3 > train_xd0.log 2>&1
LOG "model_0 gata."

LOG "Antrenez model_1 (xdomain)..."
$PY -u train.py --tag 1 --seed 1 --epochs $EPOCHS --freeze-epochs 3 > train_xd1.log 2>&1
LOG "model_1 gata."

LOG "Calibrez + evaluez pe domenii..."
$PY -u evaluate_ensemble.py > eval_xdomain.log 2>&1
LOG "Evaluare gata."

LOG "Repornesc serverul de inferență..."
pkill -f "uvicorn server:app" 2>/dev/null
sleep 2
nohup .venv/bin/uvicorn server:app --host 127.0.0.1 --port 8000 > server.log 2>&1 &
sleep 6
LOG "Health: $(curl -s http://127.0.0.1:8000/api/health)"
LOG "TERMINAT_XDOMAIN. Rezultate în artifacts/metrics_xdomain.json"
