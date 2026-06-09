import React from 'react';

const STYLE_ID = 'dn-select-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-select { display: flex; flex-direction: column; gap: 6px; position: relative; }
  .dn-select__label {
    font-family: var(--font-mono); font-size: var(--text-2xs);
    text-transform: uppercase; letter-spacing: var(--tracking-caps);
    color: var(--text-secondary);
  }
  .dn-select__trigger {
    display: flex; align-items: center; gap: var(--space-3);
    width: 100%; text-align: left;
    background: var(--surface-inset);
    border: var(--border-hairline) solid var(--border-default);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-family: var(--font-mono); font-size: var(--text-sm);
    padding: 10px 12px; cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
  }
  .dn-select__trigger:hover { border-color: var(--border-strong); }
  .dn-select__trigger:focus-visible { outline: none; border-color: var(--green-dim); box-shadow: var(--glow-green); }
  .dn-select__trigger[aria-expanded="true"] { border-color: var(--green-dim); box-shadow: var(--glow-green); }
  .dn-select__value { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .dn-select__value--ph { color: var(--text-faint); }
  .dn-select__chev { color: var(--text-muted); transition: transform var(--dur-fast) var(--ease-out); flex: none; }
  .dn-select__trigger[aria-expanded="true"] .dn-select__chev { transform: rotate(180deg); color: var(--green); }
  .dn-select__menu {
    position: absolute; top: calc(100% + 6px); left: 0; right: 0; z-index: 40;
    background: var(--surface-2);
    border: var(--border-hairline) solid var(--border-strong);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-pop);
    padding: 4px; max-height: 280px; overflow-y: auto;
  }
  .dn-select__opt {
    display: flex; align-items: center; gap: var(--space-2);
    width: 100%; text-align: left;
    background: transparent; border: none; cursor: pointer;
    color: var(--text-secondary);
    font-family: var(--font-mono); font-size: var(--text-sm);
    padding: 8px 10px; border-radius: var(--radius-sm);
  }
  .dn-select__opt:hover { background: var(--surface-3); color: var(--text-primary); }
  .dn-select__opt--on { color: var(--green-bright); }
  .dn-select__check { margin-left: auto; color: var(--green); opacity: 0; }
  .dn-select__opt--on .dn-select__check { opacity: 1; }
  `;
  document.head.appendChild(el);
}

export function Select({
  label,
  options = [],
  value,
  onChange = () => {},
  placeholder = 'Seleccionar…',
  id,
  className = '',
}) {
  useStyles();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const norm = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  const current = norm.find((o) => o.value === value);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className={['dn-select', className].filter(Boolean).join(' ')} ref={ref}>
      {label && <span className="dn-select__label">{label}</span>}
      <button
        type="button" id={id}
        className="dn-select__trigger"
        aria-haspopup="listbox" aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`dn-select__value${current ? '' : ' dn-select__value--ph'}`}>
          {current ? current.label : placeholder}
        </span>
        <svg className="dn-select__chev" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="dn-select__menu" role="listbox">
          {norm.map((o) => (
            <button
              key={o.value}
              type="button" role="option" aria-selected={o.value === value}
              className={`dn-select__opt${o.value === value ? ' dn-select__opt--on' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.label}
              <svg className="dn-select__check" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2.5 6.5 5 9l4.5-5.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
