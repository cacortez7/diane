#!/usr/bin/env bash
# Descarga los pesos de modelos a models/ (gitignored).
# WhisperX large-v3 y Demucs htdemucs_ft se auto-descargan en el primer uso.
set -euo pipefail
cd "$(dirname "$0")/.."

# Qwen3.6 35B A3B IQ4_XS (~18.35 GB) — modelo MoE para traducción local.
# Offload: 24 capas GPU (~13.5 GB VRAM) + resto en RAM.
echo "[download] Qwen3.6 35B A3B IQ4_XS → models/llm/"
uvx --from huggingface_hub hf download bartowski/Qwen_Qwen3.6-35B-A3B-GGUF \
  --include "*IQ4_XS*" \
  --local-dir models/llm/

# Fish Audio S2 Pro (~11 GB) — TTS con clonación de voz.
# Repo GATED: aceptar la Fish Audio Research License en
# https://huggingface.co/fishaudio/s2-pro y autenticarse (hf auth login).
echo "[download] Fish S2 Pro → models/tts/fish-s2-pro/"
uvx --from huggingface_hub hf download fishaudio/s2-pro \
  --local-dir models/tts/fish-s2-pro/

echo "[download] listo. Modelos en models/llm/ y models/tts/"
echo "Recuerda: llama.cpp debe compilarse con CUDA (cmake -B build -DGGML_CUDA=ON)."
