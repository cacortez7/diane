# /// script
# requires-python = ">=3.12,<3.13"
# dependencies = [
#     "whisperx>=3.3",
#     "nvidia-cudnn-cu12>=9",
# ]
# ///
"""Etapa 03: transcribe vocals.wav con WhisperX large-v3.

Word-level timestamps + VAD activados. FP16 en GPU. Escribe SRT estándar y
JSON compatible con el schema ``Transcript`` (videodub/schemas/segment.py);
el orquestador valida el JSON contra el schema al recibirlo — este script
corre en un entorno uv efímero sin el paquete videodub instalado.
"""

from __future__ import annotations

import argparse
import ctypes
import json
import sys
from pathlib import Path


def log(msg: str) -> None:
    print(f"[transcribe] {msg}", file=sys.stderr, flush=True)


def _preload_cudnn() -> None:
    """Precarga libcudnn del wheel pip vía ctypes.

    ctranslate2 (backend de faster-whisper) hace dlopen de cuDNN; como el
    wheel de nvidia-cudnn-cu12 no está en LD_LIBRARY_PATH del proceso,
    cargamos las .so explícitamente antes de importar whisperx.
    """
    try:
        import nvidia.cudnn

        # nvidia.cudnn es namespace package: __file__ es None, usar __path__
        libdir = Path(list(nvidia.cudnn.__path__)[0]) / "lib"
        for so in sorted(libdir.glob("libcudnn*.so*")):
            try:
                ctypes.CDLL(str(so), mode=ctypes.RTLD_GLOBAL)
            except OSError:
                pass
    except ImportError:
        log("nvidia-cudnn-cu12 no disponible; se asume cuDNN del sistema")


def _srt_ts(seconds: float) -> str:
    ms = int(round(max(seconds, 0.0) * 1000))
    h, rem = divmod(ms, 3_600_000)
    m, rem = divmod(rem, 60_000)
    s, ms = divmod(rem, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def main() -> int:
    parser = argparse.ArgumentParser(description="WhisperX ASR con word timestamps")
    parser.add_argument("--input", required=True, help="WAV de voz (vocals)")
    parser.add_argument("--srt", required=True, help="salida .srt")
    parser.add_argument("--json", required=True, help="salida .json (schema Transcript)")
    parser.add_argument("--model", default="large-v3")
    parser.add_argument("--language", default="en")
    parser.add_argument("--batch-size", type=int, default=8)
    args = parser.parse_args()

    _preload_cudnn()

    import torch
    import whisperx

    device = "cuda" if torch.cuda.is_available() else "cpu"
    compute_type = "float16" if device == "cuda" else "int8"
    log(f"device={device}, compute_type={compute_type}, modelo={args.model}")

    model = whisperx.load_model(
        args.model, device, compute_type=compute_type, language=args.language
    )
    audio = whisperx.load_audio(args.input)
    duration_s = len(audio) / 16000

    # whisperx aplica VAD (pyannote/silero) antes de transcribir por defecto.
    result = model.transcribe(audio, batch_size=args.batch_size, language=args.language)
    log(f"transcripción base: {len(result['segments'])} segmentos")

    align_model, metadata = whisperx.load_align_model(
        language_code=result["language"], device=device
    )
    result = whisperx.align(
        result["segments"], align_model, metadata, audio, device,
        return_char_alignments=False,
    )
    log("alineamiento word-level completado")

    segments = []
    for seg in result["segments"]:
        words = [
            {
                "word": w.get("word", ""),
                "start": w.get("start"),
                "end": w.get("end"),
                "score": w.get("score"),
            }
            for w in seg.get("words", [])
        ]
        scores = [w["score"] for w in words if w["score"] is not None]
        segments.append({
            "start": float(seg["start"]),
            "end": float(seg["end"]),
            "text": seg["text"].strip(),
            "confidence": sum(scores) / len(scores) if scores else None,
            "speaker_id": seg.get("speaker"),
            "words": words,
        })

    transcript = {
        "language": args.language,
        "segments": segments,
        "audio_path": args.input,
        "model_name": args.model,
        "duration_s": round(duration_s, 3),
    }

    json_path, srt_path = Path(args.json), Path(args.srt)
    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(transcript, ensure_ascii=False, indent=2))

    srt_lines: list[str] = []
    for i, seg in enumerate(segments, start=1):
        srt_lines += [str(i), f"{_srt_ts(seg['start'])} --> {_srt_ts(seg['end'])}", seg["text"], ""]
    srt_path.write_text("\n".join(srt_lines))
    log(f"escritos {srt_path} y {json_path}")

    print(json.dumps({
        "stage": "transcribe",
        "model": args.model,
        "device": device,
        "language": args.language,
        "n_segments": len(segments),
        "duration_s": round(duration_s, 3),
        "srt": str(srt_path),
        "json": str(json_path),
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
