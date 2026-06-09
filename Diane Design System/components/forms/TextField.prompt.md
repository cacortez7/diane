**TextField** — labelled input or textarea with a phosphor focus glow.

```jsx
<TextField label="Instrucciones de traducción" multiline rows={6}
  value={instr} onChange={setInstr}
  help="Editable en cualquier momento antes de iniciar." />

<TextField label="GEMINI_API_KEY" prefix="key:" type="password"
  value={key} onChange={setKey}
  error={key ? '' : 'Requerida para el backend Gemini.'} />
```

Set `multiline` for a textarea (uses the sans face for prose). `prefix` renders an inline mono token; `error` turns the border/help red.
