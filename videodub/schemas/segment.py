"""Schemas pydantic para segmentos y transcripciones.

Estos modelos definen el contrato de datos entre etapas (sección 6 de
CLAUDE.md). La etapa de transcripción escribe el SRT estándar **y** un JSON
que valida contra ``Transcript``; etapas posteriores (traducción, síntesis)
leen el JSON, nunca re-parsean el SRT.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class Word(BaseModel):
    """Una palabra con timestamps a nivel de palabra (WhisperX alignment)."""

    word: str
    start: float | None = None
    end: float | None = None
    score: float | None = None


class Segment(BaseModel):
    """Un segmento de habla con timestamps en segundos."""

    start: float = Field(ge=0)
    end: float = Field(ge=0)
    text: str
    confidence: float | None = None
    speaker_id: str | None = None
    words: list[Word] = Field(default_factory=list)

    @property
    def duration(self) -> float:
        return self.end - self.start


class Transcript(BaseModel):
    """Transcripción completa de un audio: segmentos + metadata."""

    language: str
    segments: list[Segment]
    audio_path: str | None = None
    model_name: str | None = None
    duration_s: float | None = None

    def to_srt(self) -> str:
        """Serializa a formato SRT estándar."""
        lines: list[str] = []
        for i, seg in enumerate(self.segments, start=1):
            lines.append(str(i))
            lines.append(f"{_srt_ts(seg.start)} --> {_srt_ts(seg.end)}")
            lines.append(seg.text.strip())
            lines.append("")
        return "\n".join(lines)


def _srt_ts(seconds: float) -> str:
    """Segundos → timestamp SRT ``HH:MM:SS,mmm``."""
    ms = int(round(max(seconds, 0.0) * 1000))
    h, rem = divmod(ms, 3_600_000)
    m, rem = divmod(rem, 60_000)
    s, ms = divmod(rem, 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


__all__ = ["Word", "Segment", "Transcript"]
