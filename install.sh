#!/usr/bin/env bash
#
# Bootstrap de Diane (Milestone 1) para Ubuntu 26.04 LTS.
#
# - Instala uv (si falta).
# - Instala Python 3.12 vía uv (evita el 3.14 del sistema; los paquetes ML
#   aún no lo soportan, ver CLAUDE.md sección 4).
# - Crea el entorno del proyecto e instala las dependencias mínimas.
# - Verifica que nvidia-smi funcione (necesario para el monitor de VRAM).
#
# NO instala PyTorch globalmente: el dummy de GPU declara torch vía metadata
# inline PEP 723 y uv lo instala en un entorno efímero al ejecutarlo.

set -euo pipefail

PY_VERSION="3.12"

info()  { printf '\033[1;34m[install]\033[0m %s\n' "$*"; }
warn()  { printf '\033[1;33m[install]\033[0m %s\n' "$*" >&2; }
fatal() { printf '\033[1;31m[install]\033[0m %s\n' "$*" >&2; exit 1; }

# --- uv ------------------------------------------------------------------- #
if ! command -v uv >/dev/null 2>&1; then
  info "uv no encontrado; instalando..."
  curl -LsSf https://astral.sh/uv/install.sh | sh
  # uv se instala típicamente en ~/.local/bin
  export PATH="$HOME/.local/bin:$PATH"
else
  info "uv ya instalado: $(uv --version)"
fi

command -v uv >/dev/null 2>&1 || fatal "uv no quedó en PATH. Reinicia la shell o agrega ~/.local/bin al PATH."

# --- Python 3.12 ---------------------------------------------------------- #
info "Instalando Python ${PY_VERSION} vía uv..."
uv python install "${PY_VERSION}"

# --- Dependencias del proyecto ------------------------------------------- #
info "Sincronizando dependencias del proyecto (incluye grupo dev)..."
uv sync --dev

# --- Verificación de nvidia-smi ------------------------------------------ #
if command -v nvidia-smi >/dev/null 2>&1; then
  info "nvidia-smi disponible:"
  nvidia-smi --query-gpu=name,memory.total,memory.used,memory.free \
    --format=csv,noheader || warn "nvidia-smi presente pero la consulta falló."
else
  warn "nvidia-smi NO encontrado. Las etapas de GPU y el test de liberación"
  warn "de VRAM no funcionarán hasta instalar el driver NVIDIA + CUDA toolkit:"
  warn "  sudo apt install nvidia-driver-XXX nvidia-cuda-toolkit"
fi

info "Listo. Corre los tests con:  uv run pytest tests/ -v"
