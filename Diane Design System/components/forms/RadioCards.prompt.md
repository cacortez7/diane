**RadioCards** — radio group as selectable cards with a description line; Diane's translation-backend picker.

```jsx
const [backend, setBackend] = React.useState('gemini');
<RadioCards
  value={backend}
  onChange={setBackend}
  options={[
    { value: 'gemini', label: 'Gemini API',
      badge: <Badge tone="cyan">online</Badge>,
      description: 'Gratis vía Google AI Studio. Requiere GEMINI_API_KEY.' },
    { value: 'local', label: 'Local · Qwen 35B',
      badge: <Badge tone="violet">offline</Badge>,
      description: 'llama.cpp 100% offline. -ngl 24 · ~13.5 GB VRAM.' },
  ]}
/>
```

Pass `row` to place two cards side-by-side. For short label-only choices use `SegmentedControl`.
