"""Schema pydantic para la traducción (Milestone 3)."""

from __future__ import annotations

from pydantic import BaseModel, Field

from videodub.schemas.segment import _srt_ts


class TranslatedSegment(BaseModel):
    """Un segmento traducido, conservando los timestamps del original."""

    start: float = Field(ge=0)
    end: float = Field(ge=0)
    source_text: str
    text: str

    @property
    def duration(self) -> float:
        return self.end - self.start


class Translation(BaseModel):
    """Traducción completa: segmentos + metadata + backend usado."""

    source_language: str
    target_language: str
    backend_used: str  # "gemini" | "local"
    model_name: str | None = None
    segments: list[TranslatedSegment]

    def to_srt(self) -> str:
        lines: list[str] = []
        for i, seg in enumerate(self.segments, start=1):
            lines.append(str(i))
            lines.append(f"{_srt_ts(seg.start)} --> {_srt_ts(seg.end)}")
            lines.append(seg.text.strip())
            lines.append("")
        return "\n".join(lines)


__all__ = ["TranslatedSegment", "Translation"]
