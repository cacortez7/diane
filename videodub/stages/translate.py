"""Etapa 04: traduce el SRT en inglés a español latinoamericano.

Dos backends intercambiables vía ``translation_backend`` en pipeline.yaml:

- **gemini**: gemini-srt-translator (API de Google AI Studio, tier gratuito).
- **local**: Qwen3.6 35B A3B servido por llama.cpp, con ventana deslizante
  de contexto (los N segmentos previos guían la traducción del siguiente).

A diferencia de las etapas con torch, esta corre en el entorno DEL PROYECTO
(``uv run python``) porque sus dependencias son livianas y necesita importar
``videodub`` (schemas + LlamaCppServer). Sigue siendo un subproceso aislado
que muere al terminar — el principio subprocess-per-stage se mantiene.

Convención sección 6: logs a stderr, JSON resumen a stdout.
"""

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path

# Permite ejecutar el script directo desde la raíz del repo.
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

import requests
import yaml

from videodub.schemas.segment import Transcript
from videodub.schemas.translation import TranslatedSegment, Translation


def log(msg: str) -> None:
    print(f"[translate] {msg}", file=sys.stderr, flush=True)


# ---------------------------------------------------------------- gemini ---

def translate_gemini(
    transcript: Transcript, input_srt: Path, output_srt: Path, config: dict
) -> Translation:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise SystemExit(
            "GEMINI_API_KEY no configurada. Agrega tu clave en ~/.bashrc o "
            "usa translation_backend: local en pipeline.yaml"
        )

    import gemini_srt_translator as gst

    gst.gemini_api_key = api_key
    gst.input_file = str(input_srt)
    gst.output_file = str(output_srt)
    gst.target_language = "Latin American Spanish"
    gst.model_name = config.get("gemini_model", "gemini-2.5-flash")
    gst.description = config.get("translation_description", "")
    gst.free_quota = True  # respeta límites del tier gratuito; NO desactivar
    # Sin esto, la librería pregunta por TTY si quiere auto-actualizarse
    # cuando hay versión nueva en PyPI — bloquea el subproceso del stage.
    gst.skip_upgrade = True
    gst.thinking = True
    gst.progress_log = True
    gst.translate()

    translated_texts = _parse_srt_texts(output_srt.read_text())
    if len(translated_texts) != len(transcript.segments):
        log(
            f"ADVERTENCIA: {len(translated_texts)} bloques traducidos vs "
            f"{len(transcript.segments)} segmentos originales"
        )

    segments = [
        TranslatedSegment(
            start=seg.start,
            end=seg.end,
            source_text=seg.text,
            text=translated_texts[i] if i < len(translated_texts) else seg.text,
        )
        for i, seg in enumerate(transcript.segments)
    ]
    return Translation(
        source_language=transcript.language,
        target_language=config.get("target_language", "es"),
        backend_used="gemini",
        model_name=gst.model_name,
        segments=segments,
    )


def _parse_srt_texts(srt: str) -> list[str]:
    """Extrae el texto de cada bloque de un SRT."""
    texts: list[str] = []
    for block in re.split(r"\n\s*\n", srt.strip()):
        lines = [l for l in block.splitlines() if l.strip()]
        if len(lines) >= 3 and "-->" in lines[1]:
            texts.append(" ".join(l.strip() for l in lines[2:]))
    return texts


# ----------------------------------------------------------------- local ---

SYSTEM_PROMPT = (
    "You are a professional EN->ES subtitle translator. Translate the given "
    "English subtitle into Latin American Spanish. Reply ONLY with the "
    "translated text, no quotes, no explanations.\n\nStyle guide: {description}"
)


def translate_local(transcript: Transcript, config: dict) -> Translation:
    from videodub.services.llamacpp_server import LlamaCppServer

    model_path = _find_gguf(config)
    window = int(config.get("translation_context_window", 8))
    system = SYSTEM_PROMPT.format(description=config.get("translation_description", ""))

    segments: list[TranslatedSegment] = []
    with LlamaCppServer(model_path) as srv:
        url = f"{srv.base_url}/v1/chat/completions"
        for i, seg in enumerate(transcript.segments):
            # Ventana deslizante: pares EN->ES previos como contexto.
            messages = [{"role": "system", "content": system}]
            for prev in segments[-window:]:
                messages.append({"role": "user", "content": prev.source_text})
                messages.append({"role": "assistant", "content": prev.text})
            messages.append({"role": "user", "content": seg.text})

            resp = requests.post(
                url,
                json={
                    "messages": messages,
                    "temperature": 0.3,
                    "max_tokens": 512,
                    # Qwen3.x es modelo razonador: sin esto, la respuesta se
                    # va al canal de thinking y "content" llega vacío.
                    "chat_template_kwargs": {"enable_thinking": False},
                },
                timeout=300,
            )
            resp.raise_for_status()
            text = resp.json()["choices"][0]["message"]["content"]
            text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
            segments.append(
                TranslatedSegment(
                    start=seg.start, end=seg.end, source_text=seg.text, text=text
                )
            )
            log(f"segmento {i + 1}/{len(transcript.segments)} traducido")

    return Translation(
        source_language=transcript.language,
        target_language=config.get("target_language", "es"),
        backend_used="local",
        model_name=model_path.name,
        segments=segments,
    )


def _find_gguf(config: dict) -> Path:
    explicit = config.get("local_llm_path")
    if explicit:
        return Path(explicit)
    llm_dir = Path(__file__).resolve().parents[2] / "models" / "llm"
    candidates = sorted(llm_dir.glob("*.gguf")) if llm_dir.exists() else []
    if not candidates:
        raise SystemExit(
            f"No hay modelos GGUF en {llm_dir}. "
            "Descargar con scripts/download_models.sh"
        )
    return candidates[0]


# ------------------------------------------------------------------ main ---

def main() -> int:
    parser = argparse.ArgumentParser(description="Traducción EN→ES dual backend")
    parser.add_argument("--input-srt", required=True)
    parser.add_argument("--input-json", required=True, help="03_transcript.json")
    parser.add_argument("--output-srt", required=True)
    parser.add_argument("--output-json", required=True)
    parser.add_argument("--config", default="config/pipeline.yaml")
    parser.add_argument("--backend", choices=["gemini", "local"], default=None,
                        help="override de translation_backend del YAML")
    args = parser.parse_args()

    config = yaml.safe_load(Path(args.config).read_text()) or {}
    backend = args.backend or config.get("translation_backend", "gemini")
    transcript = Transcript.model_validate_json(Path(args.input_json).read_text())
    log(f"backend={backend}, {len(transcript.segments)} segmentos")

    output_srt, output_json = Path(args.output_srt), Path(args.output_json)
    output_srt.parent.mkdir(parents=True, exist_ok=True)

    if backend == "gemini":
        translation = translate_gemini(transcript, Path(args.input_srt), output_srt, config)
    elif backend == "local":
        translation = translate_local(transcript, config)
        output_srt.write_text(translation.to_srt())
    else:
        raise SystemExit(f"backend desconocido: {backend}")

    output_json.write_text(translation.model_dump_json(indent=2))
    log(f"escritos {output_srt} y {output_json}")

    print(json.dumps({
        "stage": "translate",
        "backend": translation.backend_used,
        "model": translation.model_name,
        "n_segments": len(translation.segments),
        "srt": str(output_srt),
        "json": str(output_json),
    }))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
