# /// script
# requires-python = ">=3.12,<3.13"
# dependencies = [
#     "fish-speech @ git+https://github.com/fishaudio/fish-speech",
#     "soundfile>=0.12",
#     "numpy",
#     "spacy>=3.8,<3.9",
#     "es-core-news-lg @ https://github.com/explosion/spacy-models/releases/download/es_core_news_lg-3.8.0/es_core_news_lg-3.8.0-py3-none-any.whl",
# ]
#
# [tool.uv]
# # pyaudio requiere portaudio.h del sistema y solo se usa para streaming de
# # micrófono en fish-speech; lo excluimos del resolve con un marker imposible.
# override-dependencies = ["pyaudio; sys_platform == 'never'"]
# ///
"""Etapa 05: sintetiza ORACIONES COMPLETAS con Fish S2 Pro (voz clonada).

Estrategia (rediseño 2026-06): los segmentos de subtítulo se RE-SEGMENTAN
en unidades-oración antes de sintetizar — Fish produce prosodia mucho más
natural con oraciones completas que con fragmentos de subtítulo. El timing
se adapta al audio en align_timing (comprimir poco, nunca estirar, drift
acotado), no al revés.

Re-segmentación: segmentos consecutivos con gap <= merge-gap se fusionan en
bloques; cada bloque se divide en oraciones con spaCy (es_core_news_lg, va
como wheel en las deps PEP 723 — sin descarga en runtime); los timestamps
del bloque se reparten proporcionalmente a la longitud del texto. El mapeo
unidad → segmentos originales queda en el manifest (``source_segments``).

Invalidación por unidad: ``05_segments/units.json`` guarda las unidades de
la última corrida; si una unidad cambió (texto editado en revisión, otra
fusión), su WAV se borra antes de computar pendientes — la re-síntesis
parcial del flujo de revisión sale gratis.

Subprocess-per-stage: carga el modelo UNA vez y procesa todas las unidades
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


_FINAL_PUNCT = ".!?…"


def _merge_by_gap(segments: list[dict], gap_s: float) -> list[dict]:
    """Fusiona segmentos consecutivos con gap <= gap_s en bloques."""
    blocks: list[dict] = []
    for idx, seg in enumerate(segments):
        if blocks and seg["start"] - blocks[-1]["end"] <= gap_s:
            blk = blocks[-1]
            blk["text"] = f"{blk['text']} {seg['text'].strip()}"
            blk["end"] = seg["end"]
            blk["source_segments"].append(idx)
        else:
            blocks.append({
                "start": seg["start"], "end": seg["end"],
                "text": seg["text"].strip(), "source_segments": [idx],
            })
    return blocks


def _remerge_incomplete(sentences: list[str]) -> list[str]:
    """Re-fusiona oraciones incompletas (sin puntuación final y <= 20 chars)
    con la siguiente, y completa la puntuación final faltante."""
    merged: list[str] = []
    pending = ""
    for sent in sentences:
        sent = sent.strip()
        if not sent:
            continue
        if pending:
            sent = f"{pending} {sent}"
            pending = ""
        if sent[-1] not in _FINAL_PUNCT and len(sent) <= 20:
            pending = sent
            continue
        merged.append(sent)
    if pending:  # incompleta al final, sin siguiente: unidad propia
        merged.append(pending)
    return [s if s[-1] in _FINAL_PUNCT else s + "." for s in merged]


def _distribute_times(
    weights: list[int], start: float, end: float, min_unit_s: float
) -> list[tuple[float, float]]:
    """Reparte [start, end] proporcionalmente a weights, con piso min_unit_s.

    Si el bloque alcanza para el piso de todas las unidades, cada una recibe
    min_unit_s + su parte proporcional del excedente; si no, partes iguales.
    """
    n = len(weights)
    total = end - start
    if total <= min_unit_s * n:
        durs = [total / n] * n
    else:
        extra = total - min_unit_s * n
        wsum = sum(weights) or n
        durs = [min_unit_s + extra * w / wsum for w in weights]
    spans, t = [], start
    for d in durs:
        spans.append((t, t + d))
        t += d
    spans[-1] = (spans[-1][0], end)  # cerrar exacto contra el bloque
    return spans


def build_units(
    segments: list[dict],
    gap_s: float = 1.0,
    min_unit_s: float = 1.0,
    split_sentences=None,
) -> list[dict]:
    """Re-segmenta los segmentos traducidos en unidades-oración.

    ``split_sentences(text) -> list[str]`` permite inyectar el splitter
    (spaCy en producción; los tests usan uno trivial sin cargar el modelo).
    """
    if split_sentences is None:
        split_sentences = _spacy_splitter()
    units: list[dict] = []
    for blk in _merge_by_gap(segments, gap_s):
        sents = _remerge_incomplete(split_sentences(blk["text"]))
        if not sents:
            continue
        spans = _distribute_times(
            [len(s) for s in sents], blk["start"], blk["end"], min_unit_s
        )
        for sent, (s, e) in zip(sents, spans):
            units.append({
                "start": round(s, 3), "end": round(e, 3), "text": sent,
                "source_segments": blk["source_segments"],
            })
    return units


def _spacy_splitter():
    """Carga es_core_news_lg (viene como dep PEP 723, sin descarga runtime)."""
    import spacy

    nlp = spacy.load("es_core_news_lg", exclude=["ner", "lemmatizer"])
    return lambda text: [s.text for s in nlp(text).sents]


def sync_units_state(outdir: Path, units: list[dict]) -> int:
    """Compara las unidades con units.json de la corrida previa y borra los
    WAVs de las que cambiaron (texto o timestamps) o sobran. Devuelve
    cuántos WAVs invalidó. El resume por WAV existente sigue funcionando
    para las unidades intactas."""
    state_path = outdir / "units.json"
    old: list[dict] = []
    if state_path.exists():
        old = json.loads(state_path.read_text()).get("units", [])
    else:
        # Sin units.json pero con WAVs en disco = job sintetizado ANTES del
        # rediseño (numeración por segmento, no por unidad): audio inválido.
        stale = sorted(outdir.glob("[0-9][0-9][0-9][0-9].wav"))
        if stale:
            log(f"{len(stale)} WAVs pre-rediseño sin units.json — se "
                "descartan (la numeración por segmento ya no aplica)")
            for w in stale:
                w.unlink()
    invalidated = 0
    for i, unit in enumerate(units, start=1):
        prev = old[i - 1] if i <= len(old) else None
        if prev is not None and (
            prev["text"] != unit["text"]
            or abs(prev["start"] - unit["start"]) > 1e-3
            or abs(prev["end"] - unit["end"]) > 1e-3
        ):
            if (outdir / f"{i:04d}.wav").exists():
                (outdir / f"{i:04d}.wav").unlink()
                invalidated += 1
    for j in range(len(units) + 1, len(old) + 1):  # unidades sobrantes
        if (outdir / f"{j:04d}.wav").exists():
            (outdir / f"{j:04d}.wav").unlink()
            invalidated += 1
    state_path.write_text(json.dumps({"units": units}, indent=2,
                                     ensure_ascii=False))
    return invalidated


def trim_final_silence(
    audio, sr: int, threshold_db: float = -45.0, window_ms: float = 10.0,
    max_trim_ms: float = 500.0, min_trim_ms: float = 50.0
):
    """Recorta silencio SOLO del final (ventanas RMS de 10 ms, máx 500 ms,
    solo si hay > 50 ms). NUNCA toca el inicio (el arranque natural de la
    oración no se recorta). Devuelve (audio, segundos_recortados)."""
    import numpy as np

    win = max(1, int(sr * window_ms / 1000.0))
    thr = 10.0 ** (threshold_db / 20.0)
    pos, silent = len(audio), 0
    while pos > 0:
        w = audio[max(0, pos - win):pos]
        if np.sqrt(np.mean(np.square(w))) > thr:
            break
        silent += len(w)
        pos -= len(w)
    if silent / sr * 1000.0 <= min_trim_ms:
        return audio, 0.0
    trim = min(silent, int(sr * max_trim_ms / 1000.0))
    return audio[: len(audio) - trim], trim / sr


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
    # Oraciones completas necesitan más presupuesto que subtítulos; el
    # chunking interno (chunk_length=120) mantiene acotado el decode aunque
    # la generación se alargue.
    parser.add_argument("--max-new-tokens", type=int, default=1024)
    parser.add_argument("--seed", type=int, default=42,
                        help="seed fija por job: misma voz/prosodia "
                             "reproducible en todos los segmentos")
    parser.add_argument("--temperature", type=float, default=0.8)
    parser.add_argument("--top-p", type=float, default=0.8)
    parser.add_argument("--repetition-penalty", type=float, default=1.1)
    parser.add_argument("--text-padding", action="store_true",
                        help="prefijo '. ' antes de cada texto (calibrado "
                             "para S1-mini; en S2 Pro produce alucinaciones "
                             "de idioma — default off)")
    parser.add_argument("--merge-gap-ms", type=float, default=1000.0,
                        help="gap máximo entre subtítulos para fusionarlos")
    parser.add_argument("--min-unit-ms", type=float, default=1000.0,
                        help="duración mínima por unidad-oración")
    parser.add_argument("--trim-threshold-db", type=float, default=-45.0)
    parser.add_argument("--trim-max-ms", type=float, default=500.0)
    # OJO: generate_long exige prompt <= max_seq_len - 2048 (headroom
    # hardcodeado upstream), así que 4096 es el mínimo práctico.
    parser.add_argument("--max-seq-len", type=int, default=4096,
                        help="límite de contexto; el default 32768 del modelo "
                             "preasigna ~5 GB de KV cache y no cabe en 16 GB "
                             "junto con los pesos BF16 + codec")
    parser.add_argument("--reference", default=None,
                        help="WAV opcional con la voz de referencia (15-25 s). "
                             "Si no se pasa, se extrae de --vocals. Nota: al "
                             "no tener transcript, la referencia subida se usa "
                             "sin prompt-text (clonación solo acústica).")
    parser.add_argument("--max-segments", type=int, default=0,
                        help="máximo de segmentos a sintetizar en ESTA "
                             "invocación (0 = todos). El orquestador lo usa "
                             "para procesar por lotes: el proceso muere entre "
                             "lotes y el OS recupera el 100%% de la VRAM, "
                             "cortando el leak gradual del engine (~14.4→14.9 "
                             "GB a lo largo de ~100 segmentos)")
    args = parser.parse_args()

    translation = json.loads(Path(args.translation).read_text())
    segments = translation["segments"]
    outdir = Path(args.outdir)
    outdir.mkdir(parents=True, exist_ok=True)

    # Re-segmentación a oraciones completas (spaCy, CPU).
    units = build_units(
        segments,
        gap_s=args.merge_gap_ms / 1000.0,
        min_unit_s=args.min_unit_ms / 1000.0,
    )
    log(f"re-segmentación: {len(segments)} segmentos → {len(units)} "
        f"oraciones (gap <= {args.merge_gap_ms:.0f} ms)")
    invalidated = sync_units_state(outdir, units)
    if invalidated:
        log(f"{invalidated} WAV(s) invalidados (unidades cambiadas)")

    # Reanudación: los WAVs ya generados (por lotes previos o por una
    # corrida interrumpida) se saltan — caché por unidad de facto.
    pending = [
        (i, unit) for i, unit in enumerate(units, start=1)
        if not _wav_ok(outdir / f"{i:04d}.wav")
    ]
    if args.max_segments > 0:
        batch = pending[: args.max_segments]
    else:
        batch = pending
    log(f"{len(units)} unidades: {len(units) - len(pending)} ya en "
        f"disco, {len(pending)} pendientes, {len(batch)} en este lote")

    if not batch:
        _write_manifest_and_summary(outdir, units, batch_done=0)
        return 0

    if args.reference:
        ref_audio = Path(args.reference).read_bytes()
        ref_text = ""  # sin transcript de la referencia subida
        log(f"voz de referencia externa: {args.reference}")
    else:
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
    # El codec se carga en CPU, se castea a BF16 y recién entonces sube a
    # GPU. Cargarlo FP32 directo en CUDA picaba ~1.9 GB extra con el AR ya
    # ocupando ~13 GB — OOM en module.to(device) cuando apps de escritorio
    # (Brave, Showtime) retienen unas centenas de MiB. Así solo tocan VRAM
    # los pesos BF16 (~0.9 GB) y el pico de activaciones a la mitad.
    decoder = load_decoder_model(
        config_name="modded_dac_vq",
        checkpoint_path=str(model_dir / "codec.pth"),
        device="cpu",
    )
    if device == "cuda":
        decoder = decoder.to(precision).to(device)
        log(f"DAC casteado a {precision} en CPU y movido a GPU")
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
    total_audio_s, total_gen_s, total_trim_s = 0.0, 0.0, 0.0
    log(f"seed del job: {args.seed} | temperature={args.temperature} "
        f"top_p={args.top_p} repetition_penalty={args.repetition_penalty}")

    for i, unit in batch:
        # Red de seguridad anti-alucinación (la re-segmentación ya completa
        # puntuación): sin puntuación final fuerte el AR divaga al final.
        text = unit["text"].strip()
        if text and text[-1] not in _FINAL_PUNCT:
            text += "."
        # Prefijo ". " SOLO con --text-padding (S1-mini): en S2 Pro el
        # padding disparaba alucinaciones de idioma (japonés/coreano).
        if args.text_padding and text and text[0] not in ".!?…,;:":
            text = ". " + text

        # Cap de tokens por longitud del texto (~8 tokens/char con piso
        # 128): acota los runaways del AR sin recortar oraciones largas.
        max_new_tokens = min(args.max_new_tokens, max(128, len(text) * 8))
        if max_new_tokens < args.max_new_tokens:
            log(f"unidad {i}: cap de tokens {max_new_tokens} "
                f"({len(text)} chars, default {args.max_new_tokens})")

        req = ServeTTSRequest(
            text=text,
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
            max_new_tokens=max_new_tokens,
            temperature=args.temperature,
            top_p=args.top_p,
            repetition_penalty=args.repetition_penalty,
            seed=args.seed,
        )
        # Misma seed para TODAS las unidades del job: prosodia consistente.
        torch.manual_seed(args.seed)
        t0 = time.monotonic()
        final = None
        for result in engine.inference(req):
            if result.code == "error":
                raise RuntimeError(f"unidad {i}: {result.error}")
            if result.code == "final":
                final = result.audio
        if final is None:
            raise RuntimeError(f"unidad {i}: el engine no produjo audio final")

        gen_s = time.monotonic() - t0
        sr, audio = final
        audio, trimmed_s = trim_final_silence(
            audio, sr, threshold_db=args.trim_threshold_db,
            max_trim_ms=args.trim_max_ms,
        )
        if trimmed_s:
            total_trim_s += trimmed_s
            log(f"unidad {i}: {trimmed_s * 1000:.0f} ms de silencio final "
                "recortados")
        wav_path = outdir / f"{i:04d}.wav"
        sf.write(str(wav_path), audio, sr)

        audio_s = len(audio) / sr
        total_audio_s += audio_s
        total_gen_s += gen_s
        peak_gb = (
            torch.cuda.max_memory_allocated() / (1024**3)
            if torch.cuda.is_available() else 0.0
        )
        log(f"unidad {i}/{len(units)}: {audio_s:.1f}s de audio en "
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
    log(f"lote completado: {len(batch)} unidades, RTF del lote={rtf:.2f}, "
        f"trim total {total_trim_s:.1f}s")
    _write_manifest_and_summary(outdir, units, batch_done=len(batch), rtf=rtf)
    return 0


def _wav_ok(path: Path) -> bool:
    """True si el WAV existe y tiene contenido (44 bytes = solo header)."""
    return path.exists() and path.stat().st_size > 1024


def _write_manifest_and_summary(
    outdir: Path, units: list[dict], *, batch_done: int, rtf: float | None = None
) -> None:
    """Escribe el manifest SOLO cuando todos los WAVs existen.

    Las entradas son unidades-oración: traen start/end (timestamps
    repartidos del bloque original), texto y ``source_segments`` (índices
    de los segmentos de 04_translation.json que las componen) — es lo que
    align_timing usa para colocar el audio. El resumen de stdout siempre
    reporta el progreso; el orquestador relanza el stage (nuevo subproceso
    → VRAM limpia) mientras ``remaining > 0``.
    """
    remaining = [
        i for i in range(1, len(units) + 1)
        if not _wav_ok(outdir / f"{i:04d}.wav")
    ]
    complete = not remaining

    if complete:
        import soundfile as sf

        results, sr = [], None
        for i, unit in enumerate(units, start=1):
            info = sf.info(str(outdir / f"{i:04d}.wav"))
            sr = sr or info.samplerate
            results.append({
                "index": i, "file": f"{i:04d}.wav",
                "start": unit["start"], "end": unit["end"],
                "text": unit["text"],
                "duration_s": round(info.duration, 3),
                "target_duration_s": round(unit["end"] - unit["start"], 3),
                "source_segments": unit["source_segments"],
            })
        manifest = {
            "n_segments": len(results),
            "samplerate": sr,
            "total_audio_s": round(sum(r["duration_s"] for r in results), 2),
            "segments": results,
        }
        (outdir / "manifest.json").write_text(
            json.dumps(manifest, indent=2, ensure_ascii=False))
        log(f"manifest escrito: {len(results)} unidades completas")

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
