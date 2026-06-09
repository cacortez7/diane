**Button** — the primary action control; use the phosphor-green `primary` once per view for the main commit action (e.g. start the dub run).

```jsx
<Button variant="primary" size="lg" leadingIcon={<span>▶</span>}>
  Iniciar doblaje
</Button>
<Button variant="secondary">Cancelar</Button>
<Button variant="ghost" size="sm">Ver logs</Button>
<Button variant="danger">Abortar job</Button>
```

Variants: `primary` (green fill, glows on hover), `secondary` (bordered, greens on hover), `ghost` (chrome-free until hover), `danger` (red, for abort/delete). Sizes `sm | md | lg`. Pass `loading` for an inline spinner, `block` to fill width, and `leadingIcon`/`trailingIcon` for glyphs.
