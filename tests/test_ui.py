"""Tests del Milestone 6 (UI FastAPI + React).

Usa TestClient; el job de prueba corre solo hasta extract_audio (CPU, rápido)
para no depender de GPU/modelos en el flujo de la API.
"""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

import videodub.ui.server as server

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / "tests" / "fixtures" / "sample_10s.mp4"

needs_ffmpeg = pytest.mark.skipif(shutil.which("ffmpeg") is None, reason="sin ffmpeg")


@pytest.fixture()
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(server, "WORKSPACE", tmp_path / "workspace")
    server.JOBS.clear()
    return TestClient(server.app)


def test_health_and_vram(client):
    h = client.get("/api/health").json()
    assert h["ok"] is True and "gemini_key" in h
    v = client.get("/api/vram").json()
    assert "used_mib" in v and "total_mib" in v


def test_frontend_served(client):
    r = client.get("/")
    assert r.status_code == 200
    assert "DianeApp" in r.text or "App.jsx" in r.text
    assert client.get("/styles.css").status_code == 200
    assert client.get("/App.jsx").status_code == 200


def test_job_validation(client):
    r = client.post("/api/jobs", files={"file": ("v.mp4", b"x")}, data={"preset": "nope"})
    assert r.status_code == 400
    r = client.post("/api/jobs", files={"file": ("v.mp4", b"x")}, data={"backend": "nope"})
    assert r.status_code == 400


def test_download_url_validation(client):
    assert client.post("/api/download-url", json={"url": "no-es-url"}).status_code == 400
    assert client.post("/api/download-url", json={"url": "https://vimeo.com/123"}).status_code == 400
    assert client.post("/api/jobs", data={"backend": "local"}).status_code == 400  # sin file ni file_id
    assert client.post("/api/jobs", data={"backend": "local", "file_id": "zz"}).status_code == 400
    assert client.post("/api/jobs", data={"backend": "local", "file_id": "a" * 12}).status_code == 404


@needs_ffmpeg
def test_job_flow_with_file_id(client):
    """Un video ya presente en uploads/ (como deja /api/download-url) entra
    al pipeline vía file_id igual que un upload manual."""
    file_id = "abc123def456"
    uploads = server.WORKSPACE / "uploads"
    uploads.mkdir(parents=True, exist_ok=True)
    shutil.copy2(FIXTURE, uploads / f"{file_id}.mp4")

    r = client.post("/api/jobs", data={
        "preset": "fast", "backend": "local",
        "file_id": file_id, "until_stage": "extract_audio",
    })
    assert r.status_code == 200, r.text
    job_id = r.json()["job_id"]
    assert job_id == file_id

    with client.stream("GET", f"/api/jobs/{job_id}/events") as resp:
        for line in resp.iter_lines():
            if line.startswith("data: "):
                ev = json.loads(line[6:])
                if ev["type"] == "eof":
                    assert ev["status"] == "done"
                    break


@needs_ffmpeg
def test_job_flow_until_extract_audio(client):
    with FIXTURE.open("rb") as fh:
        r = client.post(
            "/api/jobs",
            files={"file": ("sample_10s.mp4", fh, "video/mp4")},
            data={"preset": "fast", "backend": "local",
                  "until_stage": "extract_audio"},
        )
    assert r.status_code == 200, r.text
    job_id = r.json()["job_id"]

    events = []
    with client.stream("GET", f"/api/jobs/{job_id}/events") as resp:
        for line in resp.iter_lines():
            if line.startswith("data: "):
                ev = json.loads(line[6:])
                events.append(ev)
                if ev["type"] == "eof":
                    break

    types = [e["type"] for e in events]
    assert "job_start" in types
    assert "stage_done" in types or "stage_cached" in types
    assert events[-1] == {"type": "eof", "status": "done"}

    done = next(e for e in events if e["type"] in ("stage_done", "stage_cached"))
    assert done["stage"] == "extract_audio"

    # Sin duplicados: cada evento de etapa aparece exactamente una vez.
    keys = [(e["type"], e.get("stage")) for e in events if e.get("stage")]
    assert len(keys) == len(set(keys)), f"eventos duplicados: {keys}"

    # Reconexión: el replay del historial tampoco duplica y termina en eof.
    replay = []
    with client.stream("GET", f"/api/jobs/{job_id}/events") as resp:
        for line in resp.iter_lines():
            if line.startswith("data: "):
                ev = json.loads(line[6:])
                replay.append(ev)
                if ev["type"] == "eof":
                    break
    assert replay == events
