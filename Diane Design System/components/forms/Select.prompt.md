**Select** — themed dropdown for the dark surfaces; Diane's instruction-template picker.

```jsx
const [tpl, setTpl] = React.useState('YouTube Tech/AI');
<Select label="Plantilla de instrucciones" value={tpl} onChange={setTpl}
  options={['YouTube Tech/AI', 'Entretenimiento', 'Documental', 'Personalizado']} />
```

Closes on outside-click. Options may be strings or `{value, label}`.
