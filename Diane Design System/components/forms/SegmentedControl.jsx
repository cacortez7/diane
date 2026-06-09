import React from 'react';

const STYLE_ID = 'dn-seg-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-seg {
    display: inline-flex;
    padding: 3px;
    gap: 2px;
    background: var(--surface-inset);
    border: var(--border-hairline) solid var(--border-subtle);
    border-radius: var(--radius-md);
  }
  .dn-seg--block { display: flex; width: 100%; }
  .dn-seg__opt {
    flex: 1;
    appearance: none; border: none; background: transparent;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: var(--weight-medium);
    color: var(--text-secondary);
    padding: 7px 14px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    white-space: nowrap;
    display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2);
    transition: color var(--dur-fast) var(--ease-out), background var(--dur-fast) var(--ease-out);
  }
  .dn-seg__opt:hover:not(.dn-seg__opt--on) { color: var(--text-primary); }
  .dn-seg__opt--on {
    background: var(--surface-3);
    color: var(--green-bright);
    box-shadow: inset 0 0 0 1px rgba(70,224,143,0.30);
  }
  .dn-seg__opt:focus-visible { outline: none; box-shadow: var(--ring); }
  .dn-seg__opt:disabled { opacity: 0.4; cursor: not-allowed; }
  `;
  document.head.appendChild(el);
}

export function SegmentedControl({
  options = [],
  value,
  onChange = () => {},
  block = false,
  name,
  className = '',
}) {
  useStyles();
  const norm = options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
  return (
    <div className={['dn-seg', block ? 'dn-seg--block' : '', className].filter(Boolean).join(' ')} role="tablist">
      {norm.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="tab"
            aria-selected={on}
            name={name}
            disabled={o.disabled}
            className={`dn-seg__opt${on ? ' dn-seg__opt--on' : ''}`}
            onClick={() => onChange(o.value)}
          >
            {o.icon && <span aria-hidden="true">{o.icon}</span>}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
