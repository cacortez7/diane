# /// script
# requires-python = ">=3.12,<3.13"
# dependencies = [
#     "demucs==4.0.1",
#     "torch>=2.2,<2.9",
#     "torchaudio>=2.2,<2.9",
#     "soundfile>=0.12",
# ]
# ///
"""Etapa 02: separa voz e instrumental con Demucs (htdemucs_ft).

torch/torchaudio fijados a <2.9: torchaudio 2.9 eliminó los backends de I/O
(sox/ffmpeg) y exige torchcodec para load/save.

Subprocess-per-stage: este script carga el modelo (~3 GB VRAM), procesa,
escribe ``vocals.wav`` + ``instrumental.wav`` y muere, devolviendo el 100%
de la VRAM al SO. Entorno uv efímero vía PEP 723 para aislar su torch.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path


def log(msg: str) -> None:
    print(f"[separate_vocals] {msg}", file=sys.stderr, flush=True)


def main() -> int:
    parser = argparse.ArgumentParser(description="Demucs: vocals + instrumental")
    parser.add_argument("--input", required=True, help="WAV de entrada")
    parser.add_argument("--vocals", required=True, help="salida vocals.wav")
    parser.add_argument("--instrumental", required=True, help="salida instrumental.wav")
    parser.add_argument("--model", default="htdemucs_ft")
    args = parser.parse_args()

    import torch
    import torchaudio
    from demucs.apply import apply_model
    from demucs.audio import convert_audio
    from demucs.pretrained import get_model

    device = "cuda" if torch.cuda.is_available() else "cpu"
    log(f"device={device}, modelo={args.model}")

    model = get_model(args.model)
    model.to(device).eval()

    wav, sr = torchaudio.load(args.input)
    wav = convert_audio(wav, sr, model.samplerate, model.audio_channels)
    log(f"audio cargado: {wav.shape[-1] / model.samplerate:.1f}s @ {model.samplerate}Hz")

    ref = wav.mean(0)
    wav_norm = (wav - ref.mean()) / (ref.std() + 1e-8)

    with torch.no_grad():
        sources = apply_model(
            model, wav_norm[None].to(device), device=device, progress=False
        )[0]
    sources = sources * (ref.std() + 1e-8) + ref.mean()

    names = model.sources  # típicamente [drums, bass, other, vocals]
    vocals = sources[names.index("vocals")].cpu()
    instrumental = torch.zeros_like(vocals)
    for i, name in enumerate(names):
        if name != "vocals":
            instrumental += sources[i].cpu()

    for path_str, tensor in ((args.vocals, vocals), (args.instrumental, instrumental)):
        path = Path(path_str)
        path.parent.mkdir(parents=True, exist_ok=True)
        torchaudio.save(str(path), tensor, model.samplerate)
        log(f"escrito {path}")

    print(json.dumps({
        "stage": "separate_vocals",
        "model": args.model,
        "device": device,
        "vocals": args.vocals,
        "instrumental": args.instrumental,
        "samplerate": model.samplerate,
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
