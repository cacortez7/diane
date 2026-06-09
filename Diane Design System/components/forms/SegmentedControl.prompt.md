**SegmentedControl** — inline switch for 2–4 short, mutually-exclusive options (Diane's quality preset picker).

```jsx
const [preset, setPreset] = React.useState('balanced');
<SegmentedControl
  block
  value={preset}
  onChange={setPreset}
  options={[
    { value: 'fast',     label: 'fast' },
    { value: 'balanced', label: 'balanced' },
    { value: 'quality',  label: 'quality' },
  ]}
/>
```

Use `block` to fill the row. For 2 options with longer descriptions (e.g. the translation backend) use `RadioCards` instead.
