# Diane App — UI kit

Full interactive recreation of Diane's single-page dubbing app (the Gradio UI specified
in `CLAUDE.md` Milestone 6, target `localhost:7860`). Built entirely from this design
system's primitives.

## Run
Open `index.html`. Pick a video (click the dropzone), choose a preset and translation
backend, optionally edit the instruction template, then **Iniciar doblaje** — the
pipeline runs a faithful fake: each stage turns green in turn, the `rich`-style log
streams to the terminal pane, the VRAM meter rises during GPU stages and drops back to
idle between them (the subprocess-per-stage story), and a dubbed-video preview appears
at the end.

## Files
- `index.html` — page shell; loads the bundle, then `icons.jsx` → `parts.jsx` → `App.jsx`, then mounts `window.DianeApp`.
- `App.jsx` — state + the fake pipeline runner (`stageDefs`, timed log/VRAM events), config panel, run panel, preview.
- `parts.jsx` — `TopBar` (mark + wordmark + compact VRAM + `:7860` badge), `UploadDropzone`, `SectionLabel`.
- `icons.jsx` — Lucide-style line icons (see Iconography note in the root readme).

## Components used
`Button`, `Badge`, `Card`, `SegmentedControl`, `RadioCards`, `Select`, `TextField`,
`StageStep`, `VramMeter`, `Terminal` — all from `window.DianeDesignSystem_<hash>`.

## Fidelity notes
The source repo had no UI implementation, so this is built from the Milestone 6 spec
(presets fast/balanced/quality; backend Gemini API vs local Qwen 35B; conditional
API-key field; instruction templates YouTube Tech/AI · Entretenimiento · Documental ·
Personalizado; live logs; per-stage progress; preview + download). Stage list, devices,
model names, VRAM footprints, and log lines mirror `videodub/core/` and `pipeline.yaml`.
