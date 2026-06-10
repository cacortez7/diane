# /// script
# requires-python = ">=3.12,<3.13"
# dependencies = [
#     "fish-speech @ git+https://github.com/fishaudio/fish-speech",
#     "soundfile>=0.12",
#     "numpy",
# ]
#
# [tool.uv]
# # pyaudio requiere portaudio.h del sistema y solo se usa para streaming de
# # micrófono en fish-speech; lo excluimos del resolve con un marker imposible.
# override-dependencies = ["pyaudio; sys_platform == 'never'"]
# ///
"""Etapa 05: sintetiza los segmentos traducidos con Fish S2 Pro (voz clonada).

Subprocess-per-stage: carga el modelo UNA vez y procesa todos los segmentos
en esta única invocación — el Dual-AR de Fish S2 se mantiene en VRAM entre
segmentos vía ``TTSInferenceEngine`` (confirmado: el api_server upstream usa
exactamente este patrón con un ModelManager persistente). Al terminar, el
proceso muere y el SO recupera el 100% de la VRAM.

Clonación zero-shot: se extrae una muestra de 15-25 s de ``02_vocals.wav``
(la voz original limpia) como referencia, junto con su texto en inglés
tomado del transcript. Precisión BF16 por default (~10 GB VRAM); ``--half``
(FP16) como fallback — el loader upstream no soporta NF4/FP8 hoy, así que
la cuantización agresiva queda como optimización futura.

Control inline: Fish S2 acepta tags ``[excited]``, ``[laughing]``, etc.
dentro del texto. Si la traducción ya trae tags (p.ej. generados por el LLM
en la etapa anterior), se pasan tal cual al modelo. La detección automática
de emociones del audio original queda para una iteración futura.
"""

from __future__ import annotations

import argparse
import gc
import io
import json
import os
import sys
import time
from pathlib import Path

# Debe fijarse ANTES de importar torch (el orquestador ya lo pasa vía
# extra_env; esto cubre ejecuciones directas del script). Mitiga OOM por
# fragmentación en las activaciones del DAC (conv1d sobre audio largo).
os.environ.setdefault("PYTORCH_CUDA_ALLOC_CONF", "expandable_segments:True")


def log(msg: str) -> None:
    print(f"[synthesize] {msg}", file=sys.stderr, flush=True)


def extract_reference(
    vocals_path: Path, segments: list[dict], min_s: float = 10.0, max_s: float = 15.0
) -> tuple[bytes, str]:
    """Extrae una muestra de voz de referencia y su texto.

    Toma segmentos consecutivos desde el inicio hasta acumular >= min_s de
    habla (o todo el audio si es más corto) y recorta el WAV a ese rango.
    """
    import soundfile as sf

    audio, sr = sf.read(str(vocals_path))
    total_s = len(audio) / sr

    end_s, texts = 0.0, []
    for seg in segments:
        texts.append(seg["source_text"])
        end_s = seg["end"]
        if end_s >= min_s:
            break
    end_s = min(max(end_s, min(min_s, total_s)), max_s, total_s)

    clip = audio[: int(end_s * sr)]
    buf = io.BytesIO()
    sf.write(buf, clip, sr, format="WAV")
    log(f"referencia de voz: {end_s:.1f}s, {len(texts)} segmentos de texto")
    return buf.getvalue(), " ".join(texts)


def main() -> int:
    parser = argparse.ArgumentParser(description="Fish S2 Pro TTS con voz clonada")
    parser.add_argument("--translation", required=True, help="04_translation.json")
    parser.add_argument("--vocals", required=True, help="02_vocals.wav (voz original)")
    parser.add_argument("--outdir", required=True, help="dir de salida 05_segments/")
    parser.add_argument("--model-dir", default="models/tts/fish-s2-pro")
    parser.add_argument("--half", action="store_true",
                        help="FP16 en vez de BF16 (fallback de VRAM)")
    # ~21.5 frames/s: 512 tokens ≈ 24 s de audio por chunk — de sobra para
    # subtítulos y acota las activaciones del decode si la generación se
    # desboca (con 1024 un runaway decodificaba ~47 s en una pasada).
    parser.add_argument("--max-new-tokens", type=int, default=512)
    # OJO: generate_long exige prompt <= max_seq_len - 2048 (headroom
    # hardcodeado upstream), así que 4096 es el mínimo práctico.
    parser.add_argument("--max-seq-len", type=int, default=4096,
                        help="límite de contexto; el default 32768 del modelo "
                             "preasigna ~5 GB de KV cache y no cabe en 16 GB "
                             "junto con los pesos BF16 + codec")
    parser.add_argument("--max-segments", type=int, default=0,
                        help="máximo de segmentos a sintetizar en ESTA "
                             "invocación (0 = todos). El orquestador lo usa "
                             "para procesar por lotes: el proceso muere entre "
                             "lotes y el OS recupera el 100% de la VRAM, "
                             "cortando el leak gradual del engine (~14.4→14.9 "
                             "GB a lo largo de ~100 segmentos)")
    args = parser.parse_args()

    translation = json.loads(Path(args.translation).read_text())
    segments = translation["segments"]
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    # Reanudación: los WAVs ya generados (por lotes previos o por una
    # corrida interrumpida) se saltan — caché por segmento de facto.
    pending = [
        (i, seg) for i, seg in enumerate(segments, start=1)
        if not _wav_ok(outdir / f"{i:04d}.wav")
    ]
    if args.max_segments > 0:
        batch = pending[: args.max_segments]
    else:
        batch = pending
    log(f"{len(segments)} segmentos: {len(segments) - len(pending)} ya en "
        f"disco, {len(pending)} pendientes, {len(batch)} en este lote")

    if not batch:
        _write_manifest_and_summary(outdir, segments, batch_done=0)
        return 0

    ref_audio, ref_text = extract_reference(Path(args.vocals), segments)

    import soundfile as sf
    import torch
    import fish_speech

    # fish_speech llama pyrootutils.setup_root(indicator=".project-root"),
    # que solo existe en el checkout git del repo, no en el wheel pip.
    # Creamos el marcador junto a site-packages para satisfacer la búsqueda.
    (Path(fish_speech.__path__[0]).parent / ".project-root").touch(exist_ok=True)

    from fish_speech.inference_engine import TTSInferenceEngine
    from fish_speech.models.dac.inference import load_model as load_decoder_model
    from fish_speech.models.text2semantic.inference import launch_thread_safe_queue
    from fish_speech.utils.schema import ServeReferenceAudio, ServeTTSRequest

    device = "cuda" if torch.cuda.is_available() else "cpu"
    precision = torch.half if args.half else torch.bfloat16
    model_dir = Path(args.model_dir)

    # setup_caches() preasigna KV cache para config.max_seq_len completo.
    # Parcheamos el config.json local del modelo a un contexto razonable
    # para segmentos de subtítulos (idempotente; solo afecta la copia local).
    config_path = model_dir / "config.json"
    model_config = json.loads(config_path.read_text())
    if model_config.get("text_config", {}).get("max_seq_len", 0) > args.max_seq_len:
        model_config["text_config"]["max_seq_len"] = args.max_seq_len
        config_path.write_text(json.dumps(model_config, indent=2))
        log(f"config.json: max_seq_len reducido a {args.max_seq_len} "
            "(evita OOM por KV cache de 32768)")

    log(f"cargando Fish S2 Pro desde {model_dir} (device={device}, {precision})")

    t0 = time.monotonic()
    llama_queue = launch_thread_safe_queue(
        checkpoint_path=str(model_dir), device=device, precision=precision,
        compile=False,
    )
    decoder = load_decoder_model(
        config_name="modded_dac_vq",
        checkpoint_path=str(model_dir / "codec.pth"),
        device=device,
    )
    if device == "cuda":
        # El codec carga en FP32 (~1.8 GB de pesos y activaciones dobles).
        # En BF16 ahorra ~0.9 GB de pesos y reduce a la mitad el pico de
        # activaciones de encode/decode — el margen pasó de navaja (~0.3 GB)
        # a cómodo. El engine ya corre la inferencia bajo autocast.
        decoder = decoder.to(precision)
        log(f"DAC convertido a {precision}")
    engine = TTSInferenceEngine(
        llama_queue=llama_queue, decoder_model=decoder,
        precision=precision, compile=False,
    )

    if device == "cuda":
        # encode_reference corre FUERA del autocast del engine y alimenta
        # audio fp32 al codec bf16; lo envolvemos en autocast.
        _encode = engine.encode_reference

        def _encode_autocast(*a, **kw):
            with torch.autocast("cuda", dtype=precision):
                return _encode(*a, **kw)

        engine.encode_reference = _encode_autocast

    log(f"modelos cargados en {time.monotonic() - t0:.1f}s")

    reference = ServeReferenceAudio(audio=ref_audio, text=ref_text)
    total_audio_s, total_gen_s = 0.0, 0.0

    for i, seg in batch:
        req = ServeTTSRequest(
            text=seg["text"],
            references=[reference],
            format="wav",
            # Chunking interno de Fish: el texto se trocea ANTES de generar
            # y el DAC decodifica POR CHUNK. Las activaciones del decode
            # escalan ~0.45 GB por segundo de audio: con 200 chars (~10-13 s)
            # un segmento largo picaba >15.5 GB y moría en conv1d; con 120
            # (~6-8 s por chunk) el pico queda ~14.3 GB.
            chunk_length=120,
            # CRÍTICO para VRAM: cachea el encode DAC de la referencia por
            # hash. Con "off", la referencia se re-encodeaba en CADA
            # segmento (167 encodes de 25 s en el caso que reventó) y el
            # pico de activaciones del encoder sumado a los pesos BF16
            # superaba los 16 GB.
            use_memory_cache="on",
            max_new_tokens=args.max_new_tokens,
            temperature=0.7,
            top_p=0.7,
            repetition_penalty=1.2,
        )
        t0 = time.monotonic()
        final = None
        for result in engine.inference(req):
            if result.code == "error":
                raise RuntimeError(f"segmento {i}: {result.error}")
            if result.code == "final":
                final = result.audio
        if final is None:
            raise RuntimeError(f"segmento {i}: el engine no produjo audio final")

        gen_s = time.monotonic() - t0
        sr, audio = final
        wav_path = outdir / f"{i:04d}.wav"
        sf.write(str(wav_path), audio, sr)

        audio_s = len(audio) / sr
        total_audio_s += audio_s
        total_gen_s += gen_s
        peak_gb = (
            torch.cuda.max_memory_allocated() / (1024**3)
            if torch.cuda.is_available() else 0.0
        )
        log(f"segmento {i}/{len(segments)}: {audio_s:.1f}s de audio en "
            f"{gen_s:.1f}s (RTF={gen_s / max(audio_s, 0.01):.2f}, "
            f"pico VRAM {peak_gb:.1f} GB)")

        # Limpieza entre segmentos: libera activaciones del DAC y resetea
        # el contador de pico. Los PESOS quedan cargados (eso es lo que
        # queremos: un solo load por invocación del stage).
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            torch.cuda.reset_peak_memory_stats()
        gc.collect()

    rtf = total_gen_s / max(total_audio_s, 0.01)
    log(f"lote completado: {len(batch)} segmentos, RTF del lote={rtf:.2f}")
    _write_manifest_and_summary(outdir, segments, batch_done=len(batch), rtf=rtf)
    return 0


def _wav_ok(path: Path) -> bool:
    """True si el WAV existe y tiene contenido (44 bytes = solo header)."""
    return path.exists() and path.stat().st_size > 1024


def _write_manifest_and_summary(
    outdir: Path, segments: list[dict], *, batch_done: int, rtf: float | None = None
) -> None:
    """Escribe el manifest SOLO cuando todos los WAVs existen.

    El resumen de stdout siempre reporta el progreso; el orquestador
    relanza el stage (nuevo subproceso → VRAM limpia) mientras
    ``remaining > 0``.
    """
    remaining = [
        i for i in range(1, len(segments) + 1)
        if not _wav_ok(outdir / f"{i:04d}.wav")
    ]
    complete = not remaining

    if complete:
        import soundfile as sf

        results, sr = [], None
        for i, seg in enumerate(segments, start=1):
            info = sf.info(str(outdir / f"{i:04d}.wav"))
            sr = sr or info.samplerate
            results.append({
                "index": i, "file": f"{i:04d}.wav",
                "duration_s": round(info.duration, 3),
                "target_duration_s": round(seg["end"] - seg["start"], 3),
            })
        manifest = {
            "n_segments": len(results),
            "samplerate": sr,
            "total_audio_s": round(sum(r["duration_s"] for r in results), 2),
            "segments": results,
        }
        (outdir / "manifest.json").write_text(json.dumps(manifest, indent=2))
        log(f"manifest escrito: {len(results)} segmentos completos")

    print(json.dumps({
        "stage": "synthesize",
        "outdir": str(outdir),
        "batch_done": batch_done,
        "remaining": len(remaining),
        "complete": complete,
        **({"rtf": round(rtf, 3)} if rtf is not None else {}),
    }))


if __name__ == "__main__":
    raise SystemExit(main())
