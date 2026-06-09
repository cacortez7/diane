# Diane Design System

**Diane** is a local, offline **English → Latin-American-Spanish video dubbing pipeline** —
a developer tool that runs 100% on your own GPU. Feed it an MP4; it separates the
voice from the music, transcribes the English, translates to neutral LatAm Spanish,
**clones the original speaker's voice** to synthesize the Spanish, re-times each line
to fit the original, and remuxes the dubbed audio back over the video (optionally with
AI lip-sync). Primary use case: dubbing technical / creator YouTube content.

It is, at heart, a **terminal program**: a `rich`-logged CLI orchestrator that launches
each GPU stage as an isolated subprocess (so the OS reclaims 100% of VRAM between
stages), plus a planned single-page **Gradio web UI on `localhost:7860`**. This design
system therefore speaks one consistent language: **dark, monospace, CRT-phosphor
terminal** — the GUI is the terminal, dressed up.

> The codename *Diane* nods to *Twin Peaks* — Agent Cooper's voice memos "Diane, …".
> Fitting for a tool whose whole job is voices on tape.

## Sources

This system was reverse-engineered from the project's codebase and living spec. If you
have access, read them to design with higher fidelity:

- **GitHub — `cacortez7/diane`**: https://github.com/cacortez7/diane
  - `CLAUDE.md` — the full architecture + milestone spec (the single best source). The
    Gradio UI is specified in **Milestone 6** (it is not yet implemented in code, so the
    app UI kit here is built faithfully from that spec + the `rich` logging aesthetic).
  - `videodub/core/{orchestrator,runner,vram,logger}.py` — the pipeline engine, stage
    list, VRAM monitor, and `rich` log vocabulary that drive the UI components.
  - `config/pipeline.yaml` — default config (preset, backend, translation rules).
  - `README.md` — milestone status summary.

At the time of writing the repo had **no UI code** (`videodub/ui/` was an empty package)
and **no brand assets, fonts, or colors**. The visual language in this system is an
original interpretation grounded in: the terminal/`rich` output, the Gradio `:7860`
target, the Spanish-language domain, and the engineering values in `CLAUDE.md`
(subprocess isolation, VRAM-awareness, hash caching, offline-first).

---

## Content Fundamentals

**Language: Spanish (neutral Latin American, "es-419").** The product, its UI, and its
logs are in Spanish. English survives only as *technical tokens* — flag names
(`-ngl 24`), file names (`07_final.mp4`), model names (`WhisperX large-v3`), stage
identifiers (`separate_vocals`), and code. Never translate those; they are API.

**Voice & tone.** Engineer-to-engineer, terse, factual. Reads like good CLI output and
good commit messages: lowercase, present tense, no marketing. The spec itself models the
tone — *"subprocess-per-stage", "cada etapa muere → libera 100% VRAM → siguiente
arranca"*. Confidence without hype.

**Casing.**
- **lowercase** for the wordmark, stage names, flags, file paths, and inline mono tokens (`extract_audio`, `~/workspace`, `rc=0`).
- **UPPERCASE + wide tracking** for section labels / kickers only (`ENTRADA`, `PIPELINE`, `REGISTRO EN VIVO`). This is the one place we shout — like a column header.
- **Sentence case** for prose help text and descriptions.
- Never Title Case headings.

**Person.** Address the user as *tú* implicitly via imperatives — *"Arrastra un video
MP4 aquí"*, *"Iniciar doblaje"*, *"Carga un video para empezar"*. The system narrates
itself in third person in logs — *"job a1f9 → workspace/…"*, *"← separate_vocals | rc=0"*.

**Numbers & units.** Always concrete and mono: `16 GB`, `13.5 / 16 GB`, `~13.5 GB VRAM`,
`-ngl 24`, `8.4s`, `RTF`, `Δ VRAM +0`, `1920×1080`. Use tabular figures so columns align.
(Note the product's *own* translation rule inverts this for dubbed speech — numbers
become words: `17 = diecisiete` — but that is content it produces, not UI chrome.)

**Status words** (consistent vocabulary): `en espera` · `corriendo` / `doblando…` ·
`completado` · `listo` · `rc=0` · `cached` (hash hit) · `OOM` / `falló`.

**Emoji: essentially none.** The brand uses **unicode glyphs as punctuation**, not emoji:
`→ ← » · ✓ ✗ ▶ ↗ ⚠ ●`. A single `✓` or `⚠` in a log line is on-brand; a 😀 is not.

**Example copy (lifted / in-voice):**
- `job a1f9c2d4 → workspace/a1f9c2d4`
- `→ etapa separate_vocals | VRAM antes: 412 MiB`
- `← separate_vocals | rc=0 | 8.4s | Δ VRAM +0`
- `listo — outputs en 07_final.mp4`
- Backend label: *"Local · Qwen 35B — llama.cpp 100% offline · -ngl 24 · ~13.5 GB VRAM."*
- Dubbed subtitle (shows the phonetic rule): *"— Hola, soy Stív Yobs, fundador de Ápol."*

---

## Visual Foundations

**Overall vibe.** A high-end dark terminal / TUI rendered for the browser. Think a
well-typeset `htop` / `tmux` session meets a focused single-purpose web app. Calm,
dense, technical, *quiet* — color is rare and meaningful, never decorative.

**Color.** Near-black backgrounds with a faint cool green-cyan cast (`#0c1213`), layered
in a tight surface ramp (base → canvas → surface-1/2/3 → inset). Foreground is an
off-white (`#e7ede9`) with a 4-step dim ramp. Accents are an **ANSI-derived set** used
semantically:
- **Phosphor green `#46e08f`** is the brand. It means *success / done / healthy / commit*. The CTA is green; a finished stage is green; idle VRAM is green; the cursor is green.
- **Cyan `#41cfe0`** means *motion* — the stage running right now, links, focus-adjacent.
- **Amber** = warning / VRAM pressure / CPU stage. **Red** = error / OOM / abort. **Violet** = LLM / local-model accent. **Blue** = info.
- There is **no light theme**. Everything is tuned for dark.

**Type.** Monospace-forward. **IBM Plex Mono** is the hero — headings, data, logs,
labels, the wordmark — engineered and mechanical, at home next to CUDA flags.
**IBM Plex Sans** appears only for running prose (descriptions, help, instruction
templates). When in doubt, use mono. Slashed zero and tabular numerics are on
(`font-feature-settings: "zero" 1`). Display weight 700 with slightly tight tracking;
labels uppercase with wide tracking.

**Backgrounds & texture.** Flat dark fills, occasionally a *very* subtle vertical
gradient on bars/headers (surface-2 → surface-1). No photography, no illustration, no
big hero imagery. The one texture is a faint scanline/segment hatch inside the VRAM bar
fill. The preview video frame uses a soft radial vignette. No noise/grain.

**Borders.** Hairline (`1px`) is the default separator; this is a line-driven UI. Three
weights (subtle / default / strong) plus a green focus border. Stage rows carry a **2px
colored left rail** that encodes status — the single most characteristic border move.

**Corner radii.** Small and technical: `2–8px`. Inputs/buttons `5px`, panels `8px`,
status chips `3px`, pills only for the VRAM track and dots. Nothing is very round.

**Shadows & elevation.** Restrained. Panels get a soft, mostly-downward shadow
(`shadow-panel`); popovers get `shadow-pop`. Elevation is mostly communicated by
*border + surface step*, not blur.

**The signature effect — phosphor glow.** Accent (green) and active (cyan) elements emit
a soft colored halo (`glow-green` / `glow-cyan`): the primary button on hover, a focused
field, the selected radio card, the running-stage rail, the VRAM fill, the blinking
cursor, and `text-shadow` on success text. Glow is the brand's "light"; use it only on
genuinely active/accent elements so it stays special.

**Transparency & blur.** Sparse. The subtitle strip over the preview uses a translucent
dark plate with a small `backdrop-filter: blur`. Otherwise surfaces are opaque.

**Motion.** Subtle and fast (`120–360ms`, `ease-out`). Allowed: color/border/shadow
transitions on hover/focus, the VRAM bar width easing, a `0.7s` linear spinner for
running stages, and a `~1.05s` **blinking block cursor** (step-end) — the one piece of
ambient looping motion, and only where a terminal would blink. No bounces, no parallax,
no decorative loops.

**Hover / press.** Hover = lift in surface step and/or gain the accent (e.g. secondary
button greens its text + border; ghost gains a surface). Primary hover adds the green
glow. Press = `translateY(1px)` (a tactile keypress), no scale. Focus-visible = a 2px
green ring offset from the background.

**Cards.** Dark `surface-1`, hairline `subtle` border, `8px` radius, soft panel shadow,
and an optional **terminal-style title bar** (monospace title, optional three window
dots, right-aligned actions). Full-bleed content (logs, video) uses a flush body.

**Layout rules.** Desktop app shell, `localhost:7860`. A two-column working layout:
config on the left (≈420–460px), the live run panel on the right (sticky). A persistent
top bar carries the mark + wordmark, a compact VRAM meter, and the `localhost:7860`
badge. Dense 4px spacing grid; generous gaps *between* panels, tight gaps *within*.

---

## Iconography

Diane's CLI has **no icon set** — it speaks in **unicode glyphs** inside `rich` log
lines, and that is the brand's native iconography:

- `→ ←` stage enter/exit · `»` stage marker · `·` separators · `●` status dots ·
  `✓` ok / `✗` fail · `▶` run · `↗` external/download · `⚠` warning · the green **block
  cursor `▋`** for "live / waiting for input".

For the **web GUI**, which needs real affordance icons (upload, play, download, key,
etc.), this system adopts a small **Lucide-style line-icon set** — 24×24, `stroke:
currentColor`, `stroke-width: 2`, round caps/joins — defined in
`ui_kits/diane-app/icons.jsx` (`IconUpload`, `IconFilm`, `IconPlay`, `IconDownload`,
`IconKey`, `IconCpu`, `IconChip`, `IconLanguages`, `IconWaveform`, `IconTerminal`,
`IconSparkles`, `IconRefresh`). They inherit `currentColor` so they pick up accent tones.

> **⚠ Substitution flag.** The source project ships no icons. The line icons here are
> **Lucide-style approximations** (Lucide is MIT-licensed; stroke 2, rounded — the de-facto
> match for this kind of dev tool). If you want the real Lucide set, load
> `lucide` and swap the components 1:1, or send a bespoke icon set and I'll vendor it.

**Logo / mark.** `assets/diane-mark.svg` — a terminal-prompt glyph (green chevron `>` +
block cursor) in a dark rounded tile with a faint phosphor glow. The wordmark is simply
**`diane`** set in IBM Plex Mono 700, lowercase, with an optional blinking green block
cursor. See the Brand cards in the Design System tab.

> **⚠ Font flag.** IBM Plex Mono / IBM Plex Sans load from the Google Fonts CDN (see
> `tokens/fonts.css`), not bundled binaries. For a truly offline build (apt for a 100%-local
> tool) ask me to vendor the woff2 files into the project.

---

## Index / manifest

**Root**
- `styles.css` — the single entry point consumers link (imports only).
- `readme.md` — this guide.
- `SKILL.md` — Agent-Skill front-matter for using this system in Claude Code.

**`tokens/`** — design tokens, each `@import`ed by `styles.css`
- `fonts.css` · `colors.css` · `typography.css` · `spacing.css` · `effects.css` (radii/shadows/glows/motion) · `base.css` (reset + keyframes)

**`assets/`**
- `diane-mark.svg` — app mark / favicon.

**`components/`** — reusable React primitives (namespace `window.DianeDesignSystem_*`)
- `core/` — **Button**, **Badge**, **Card**
- `forms/` — **SegmentedControl**, **RadioCards**, **Select**, **TextField**, **Toggle**
- `pipeline/` — **StageStep**, **VramMeter**, **Terminal** *(the signature trio)*

**`ui_kits/diane-app/`** — full interactive recreation of the dubbing app (`:7860`)
- `index.html` (mounts) · `App.jsx` (state + fake pipeline runner) · `parts.jsx` (TopBar, UploadDropzone) · `icons.jsx` (line icons)

**`guidelines/`** — foundation specimen cards (Colors, Type, Spacing, Brand) shown in the Design System tab.

### How to consume
Link `styles.css`, then load `_ds_bundle.js` (auto-generated) and read components from
`window.DianeDesignSystem_<hash>` (run `check_design_system` for the exact namespace).
Compose UI kits from the primitives — don't re-implement them.
