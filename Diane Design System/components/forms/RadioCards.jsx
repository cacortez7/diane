import React from 'react';

const STYLE_ID = 'dn-radiocards-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-rc { display: flex; flex-direction: column; gap: var(--space-2); }
  .dn-rc--row { flex-direction: row; }
  .dn-rc--row .dn-rc__opt { flex: 1; }
  .dn-rc__opt {
    display: flex; align-items: flex-start; gap: var(--space-3);
    text-align: left;
    padding: var(--space-3) var(--space-4);
    background: var(--surface-2);
    border: var(--border-hairline) solid var(--border-default);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: border-color var(--dur-fast) var(--ease-out),
                background var(--dur-fast) var(--ease-out),
                box-shadow var(--dur-fast) var(--ease-out);
  }
  .dn-rc__opt:hover:not(.dn-rc__opt--on) { border-color: var(--border-strong); background: var(--surface-3); }
  .dn-rc__opt--on {
    border-color: var(--green-dim);
    background: var(--green-deep);
    box-shadow: var(--glow-green);
  }
  .dn-rc__opt:focus-visible { outline: none; box-shadow: var(--ring); }
  .dn-rc__opt:disabled { opacity: 0.45; cursor: not-allowed; }
  .dn-rc__radio {
    width: 16px; height: 16px; margin-top: 1px; flex: none;
    border-radius: 50%;
    border: 2px solid var(--border-strong);
    display: grid; place-items: center;
    transition: border-color var(--dur-fast) var(--ease-out);
  }
  .dn-rc__opt--on .dn-rc__radio { border-color: var(--green); }
  .dn-rc__radio::after {
    content: ''; width: 7px; height: 7px; border-radius: 50%;
    background: var(--green); transform: scale(0);
    transition: transform var(--dur-fast) var(--ease-out);
    box-shadow: var(--glow-text-green);
  }
  .dn-rc__opt--on .dn-rc__radio::after { transform: scale(1); }
  .dn-rc__text { min-width: 0; }
  .dn-rc__label {
    font-family: var(--font-mono); font-size: var(--text-sm);
    font-weight: var(--weight-medium); color: var(--text-primary);
    display: flex; align-items: center; gap: var(--space-2);
  }
  .dn-rc__opt--on .dn-rc__label { color: var(--green-bright); }
  .dn-rc__desc {
    font-family: var(--font-sans); font-size: var(--text-xs);
    color: var(--text-secondary); margin-top: 3px; line-height: var(--leading-snug);
  }
  `;
  document.head.appendChild(el);
}

export function RadioCards({
  options = [],
  value,
  onChange = () => {},
  row = false,
  className = '',
}) {
  useStyles();
  return (
    <div className={['dn-rc', row ? 'dn-rc--row' : '', className].filter(Boolean).join(' ')} role="radiogroup">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={o.disabled}
            className={`dn-rc__opt${on ? ' dn-rc__opt--on' : ''}`}
            onClick={() => onChange(o.value)}
          >
            <span className="dn-rc__radio" aria-hidden="true" />
            <span className="dn-rc__text">
              <span className="dn-rc__label">{o.label}{o.badge}</span>
              {o.description && <span className="dn-rc__desc">{o.description}</span>}
            </span>
          </button>
        );
      })}
    </div>
  );
}
