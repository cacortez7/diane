# Diane — Pipeline de Doblaje EN→ES

Herramienta local que dobla videos del inglés al español neutro latinoamericano,
ejecutándose 100% offline en GPU local. Ver [`CLAUDE.md`](CLAUDE.md) para la
especificación completa, la arquitectura y los milestones.

> **Principio rector:** subprocess-per-stage. Cada etapa que usa GPU corre como
> un subproceso aislado que carga su modelo, hace su trabajo, escribe a disco y
> muere — para que el SO recupere el 100% de la VRAM entre etapas.

## Estado

**Milestone 4 — Síntesis con Fish S2 Pro.** La etapa `synthesize` clona la
voz original (muestra de 15-25 s de `02_vocals.wav`, zero-shot) y genera cada
segmento traducido como WAV en `05_segments/`, con manifest de duraciones y
RTF. BF16 por default; el stage reduce `max_seq_len` del modelo a 4096 para
caber en 16 GB de VRAM. Modelo: `scripts/download_models.sh` (licencia Fish
Audio Research, no comercial).

**Milestone 3 — Traducción dual backend.** La etapa `translate` convierte el
SRT en inglés a español latinoamericano con dos backends intercambiables vía
`translation_backend` en `config/pipeline.yaml`:

- `gemini` — [gemini-srt-translator](https://pypi.org/project/gemini-srt-translator/)
  con el tier gratuito de Google AI Studio (requiere `GEMINI_API_KEY` en el
  entorno).
- `local` — Qwen3.6 35B A3B (GGUF IQ4_XS) servido por llama.cpp 100% offline
  (requiere compilar `llama-server` con CUDA y `scripts/download_models.sh`).

```bash
uv run python -m videodub run --input video.mp4 --stage translate
uv run python scripts/benchmark_translate.py --input-srt ... --input-json ...
```

**Milestone 2 — Pipeline de audio.** Sobre la base de M1 (logging rich,
monitor de VRAM, `StageRunner`), el orquestador convierte un MP4 en un SRT en
inglés: extracción de audio (FFmpeg) → separación de voz (Demucs htdemucs_ft)
→ transcripción con word-level timestamps (WhisperX large-v3). Caché por hash
de inputs + config: re-ejecutar el mismo video no re-corre etapas.

```bash
uv run python -m videodub run --input video.mp4 --stage transcribe
```

Outputs en `workspace/<job_id>/` (`01_audio.wav`, `02_vocals.wav`,
`02_instrumental.wav`, `03_transcript.srt`, `03_transcript.json`).
Requiere `ffmpeg` en PATH (apt o binario estático).

## Requisitos

- Ubuntu 26.04 LTS (objetivo) — funciona el código puro en cualquier Linux.
- [`uv`](https://docs.astral.sh/uv/) (el instalador lo instala si falta).
- Python 3.12 (gestionado por `uv`; **no** usar el 3.14 del sistema).
- Para etapas de GPU: driver NVIDIA + `nvidia-smi` en PATH (RTX 4070 Ti SUPER).

## Instalación

```bash
bash install.sh
```

Instala `uv`, Python 3.12, las dependencias del proyecto, y verifica
`nvidia-smi`. No instala PyTorch globalmente: el dummy de GPU lo declara vía
metadata inline PEP 723 y `uv` lo instala en un entorno efímero.

## Tests

```bash
uv run pytest tests/ -v
```

- Los tests de **mecánica del runner** (timeouts, parseo de resumen, códigos de
  salida) corren en cualquier máquina, sin GPU.
- El test de **liberación de VRAM** (`test_dummy_releases_vram_across_three_runs`)
  requiere una GPU NVIDIA con `nvidia-smi`; se **salta** automáticamente si no
  hay GPU.

Para correr solo el runner:

```bash
uv run pytest tests/test_runner.py -v
```

## CLI de diagnóstico

```bash
uv run python -m videodub vram-info     # estado de VRAM vía nvidia-smi
uv run python -m videodub dummy          # corre la etapa dummy de GPU
```

## Estructura

Ver sección 5 de [`CLAUDE.md`](CLAUDE.md). En resumen:

```
videodub/core/      orquestación: logger, vram, runner (sin GPU)
videodub/stages/    etapas ejecutables independientes (subprocesos)
config/pipeline.yaml metadata del proyecto
tests/              pytest
```
