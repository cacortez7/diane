---
name: diane-design
description: Use this skill to generate well-branded interfaces and assets for Diane — a local, offline EN→ES video dubbing tool with a dark, monospace, CRT-phosphor terminal aesthetic — for production or for throwaway prototypes/mocks. Contains essential design guidelines, colors, type, fonts, the app mark, and a UI-kit of React components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files
(`styles.css` + `tokens/` for the foundations, `components/` for primitives,
`ui_kits/diane-app/` for the full app recreation, `guidelines/` for specimen cards,
`assets/` for the mark).

Diane is a terminal program first: dark backgrounds, IBM Plex Mono, phosphor-green
success accent, cyan for in-progress, restrained glow as the only "light". The UI is
in neutral Latin American Spanish; keep English only for technical tokens (flags, file
names, stage names). See the Content Fundamentals and Visual Foundations sections of
the readme before writing copy or choosing color.

If creating visual artifacts (slides, mocks, throwaway prototypes), copy the assets you
need out of this skill and produce static HTML files for the user to view — link
`styles.css`, reuse the tokens, and lean on the terminal/log vocabulary. If working in
production code, copy the assets and read the rules here to become an expert at
designing with this brand, then build with the real components.

If the user invokes this skill without other guidance, ask them what they want to build
or design, ask a few focused questions (surface, fidelity, options), and act as an
expert designer who outputs either HTML artifacts or production code, depending on the
need.
