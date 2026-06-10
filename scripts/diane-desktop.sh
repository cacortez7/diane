#!/usr/bin/env bash
# Lanzador de escritorio de Diane.
#
# - Arranca el server FastAPI en background (si no hay uno corriendo ya).
# - Abre el navegador en modo app apuntando a localhost:7860.
# - Al cerrar la ventana del navegador (o matar este script), mata el
#   server que arrancó él mismo para liberar el puerto. Si encontró un
#   server ajeno ya corriendo, lo respeta y no lo toca.
#
# Con navegadores Chromium (--app) el proceso vive mientras la ventana
# está abierta → cierre detectable. Con Firefox se espera al proceso
# lanzado (funciona si Firefox no estaba ya abierto). Último recurso:
# xdg-open, sin detección de cierre (el server queda corriendo y se avisa).
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
URL="http://127.0.0.1:7860"
LOG="/tmp/diane_ui.log"

export PATH="$HOME/.local/bin:$PATH"
# GEMINI_API_KEY vive en ~/.bashrc y las sesiones GUI no lo cargan.
if [ -f "$HOME/.bashrc" ]; then
  eval "$(grep '^export GEMINI_API_KEY' "$HOME/.bashrc" 2>/dev/null)" || true
fi

SERVER_PGID=""

cleanup() {
  if [ -n "$SERVER_PGID" ]; then
    kill -- "-$SERVER_PGID" 2>/dev/null
    sleep 1
    kill -9 -- "-$SERVER_PGID" 2>/dev/null
  fi
}
trap cleanup EXIT INT TERM

health_ok() {
  curl -sf --max-time 2 "$URL/api/health" >/dev/null 2>&1
}

if ! health_ok; then
  cd "$ROOT"
  # setsid: grupo de procesos propio para poder matar uv + python juntos.
  setsid uv run python -m videodub ui >"$LOG" 2>&1 &
  SERVER_PGID=$!
  for _ in $(seq 1 30); do
    health_ok && break
    sleep 1
  done
  if ! health_ok; then
    notify-send "Diane" "El server no arrancó — revisa $LOG" 2>/dev/null || true
    exit 1
  fi
fi

# Navegadores con modo app (el proceso vive mientras la ventana exista).
# Brave (snap) primero: es el navegador del usuario. El perfil dedicado
# (--user-data-dir) garantiza un proceso propio aunque el navegador ya
# esté abierto; para el snap debe vivir bajo ~/snap/brave (confinamiento).
if [ -x /snap/bin/brave ]; then
  /snap/bin/brave --app="$URL" \
    --user-data-dir="$HOME/snap/brave/common/diane-app" >/dev/null 2>&1
  exit 0   # ventana cerrada → trap mata el server
fi
for browser in google-chrome chromium chromium-browser brave-browser microsoft-edge; do
  if command -v "$browser" >/dev/null 2>&1; then
    "$browser" --app="$URL" --user-data-dir="$HOME/.cache/diane-app" >/dev/null 2>&1
    exit 0
  fi
done

if command -v firefox >/dev/null 2>&1; then
  start_ts=$SECONDS
  firefox --new-window "$URL" >/dev/null 2>&1
  if (( SECONDS - start_ts < 5 )); then
    # Retornó al instante: delegó a una instancia de Firefox ya abierta y
    # no hay forma de detectar el cierre de esa ventana — dejar el server.
    notify-send "Diane" "Server en $URL — cierra Diane desde el menú de la app o mata 'videodub ui' para liberar el puerto" 2>/dev/null || true
    SERVER_PGID=""
  fi
  exit 0   # si bloqueó hasta aquí, la ventana se cerró → trap mata el server
fi

# Sin navegador detectable: abrir y dejar el server corriendo.
xdg-open "$URL" >/dev/null 2>&1 || true
notify-send "Diane" "Server en $URL — sin detección de cierre, queda corriendo" 2>/dev/null || true
SERVER_PGID=""   # no matarlo al salir
exit 0
