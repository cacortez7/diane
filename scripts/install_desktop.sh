#!/usr/bin/env bash
# Instala Diane como app de escritorio en Ubuntu:
# - genera ~/.local/share/applications/diane.desktop (menú de aplicaciones)
# - copia el acceso directo al Escritorio y lo marca como confiable
set -eu

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LAUNCHER="$ROOT/scripts/diane-desktop.sh"
ICON="$ROOT/videodub/ui/static/assets/diane-mark.svg"
APPS_DIR="$HOME/.local/share/applications"
DESKTOP_FILE="$APPS_DIR/diane.desktop"

chmod +x "$LAUNCHER"
mkdir -p "$APPS_DIR"

cat > "$DESKTOP_FILE" <<EOF
[Desktop Entry]
Type=Application
Name=Diane
Comment=Doblaje de videos EN → ES (local)
Exec=$LAUNCHER
Icon=$ICON
Terminal=false
Categories=AudioVideo;Audio;Video;
StartupNotify=true
EOF
chmod +x "$DESKTOP_FILE"

command -v update-desktop-database >/dev/null 2>&1 && update-desktop-database "$APPS_DIR" || true

# Acceso directo en el escritorio (GNOME exige marcarlo como confiable).
DESKTOP_DIR="$(xdg-user-dir DESKTOP 2>/dev/null || echo "$HOME/Desktop")"
if [ -d "$DESKTOP_DIR" ]; then
  cp "$DESKTOP_FILE" "$DESKTOP_DIR/diane.desktop"
  chmod +x "$DESKTOP_DIR/diane.desktop"
  gio set "$DESKTOP_DIR/diane.desktop" metadata::trusted true 2>/dev/null || true
fi

echo "Instalado: $DESKTOP_FILE"
[ -d "${DESKTOP_DIR:-}" ] && echo "Acceso directo: $DESKTOP_DIR/diane.desktop"
