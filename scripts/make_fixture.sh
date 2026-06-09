#!/usr/bin/env bash
# Regenera tests/fixtures/sample_10s.mp4: video de prueba con voz TTS en
# inglés (gTTS, requiere internet) + tono de fondo a 220 Hz.
set -euo pipefail
cd "$(dirname "$0")/.."

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

uvx --from gtts gtts-cli \
  "Hello and welcome to the channel. Today we are testing the Diane dubbing pipeline with a short sample video." \
  --lang en --output "$TMP/speech.mp3"

mkdir -p tests/fixtures
ffmpeg -y -v error \
  -f lavfi -i "testsrc2=size=640x360:rate=25:duration=10" \
  -f lavfi -i "sine=frequency=220:duration=10" \
  -i "$TMP/speech.mp3" \
  -filter_complex "[1:a]volume=0.15[bg];[2:a]apad[sp];[bg][sp]amix=inputs=2:duration=first[a]" \
  -map 0:v -map "[a]" -c:v libx264 -pix_fmt yuv420p -c:a aac -t 10 \
  tests/fixtures/sample_10s.mp4

echo "fixture regenerado: tests/fixtures/sample_10s.mp4"
