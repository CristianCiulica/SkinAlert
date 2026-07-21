# Hugging Face Space (Docker) — SkinAlert inference API
FROM python:3.11-slim

# libgomp1 e necesar pentru PyTorch pe imaginea slim
RUN apt-get update && apt-get install -y --no-install-recommends libgomp1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# HF Spaces (Docker) expune implicit portul 7860
EXPOSE 7860
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "7860"]
