import React from 'react';

const STYLE_ID = 'dn-toggle-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-toggle { display: inline-flex; align-items: center; gap: var(--space-3); cursor: pointer; }
  .dn-toggle--disabled { opacity: 0.45; cursor: not-allowed; }
  .dn-toggle__track {
    position: relative; width: 38px; height: 22px; flex: none;
    background: var(--surface-inset);
    border: var(--border-hairline) solid var(--border-strong);
    border-radius: var(--radius-pill);
    transition: background var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out), box-shadow var(--dur-base) var(--ease-out);
  }
  .dn-toggle__track--on { background: var(--green-deep); border-color: var(--green-dim); box-shadow: var(--glow-green); }
  .dn-toggle__knob {
    position: absolute; top: 2px; left: 2px;
    width: 16px; height: 16px; border-radius: 50%;
    background: var(--text-muted);
    transition: transform var(--dur-base) var(--ease-out), background var(--dur-base) var(--ease-out);
  }
  .dn-toggle__track--on .dn-toggle__knob { transform: translateX(16px); background: var(--green); }
  .dn-toggle input:focus-visible + .dn-toggle__track { box-shadow: var(--ring); }
  .dn-toggle__label { font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-primary); }
  `;
  document.head.appendChild(el);
}

export function Toggle({
  checked = false,
  onChange = () => {},
  label = null,
  disabled = false,
  id,
  className = '',
}) {
  useStyles();
  return (
    <label className={['dn-toggle', disabled ? 'dn-toggle--disabled' : '', className].filter(Boolean).join(' ')} htmlFor={id}>
      <input
        id={id} type="checkbox" checked={checked} disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
      />
      <span className={`dn-toggle__track${checked ? ' dn-toggle__track--on' : ''}`} aria-hidden="true">
        <span className="dn-toggle__knob" />
      </span>
      {label != null && <span className="dn-toggle__label">{label}</span>}
    </label>
  );
}
