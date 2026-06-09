import React from 'react';

/* Inject component styles once. */
const STYLE_ID = 'dn-button-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-btn {
    --_bg: var(--surface-2);
    --_fg: var(--text-primary);
    --_bd: var(--border-default);
    display: inline-flex; align-items: center; justify-content: center;
    gap: var(--space-2);
    font-family: var(--font-ui);
    font-weight: var(--weight-medium);
    line-height: 1;
    white-space: nowrap;
    border: var(--border-hairline) solid var(--_bd);
    background: var(--_bg);
    color: var(--_fg);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: background var(--dur-fast) var(--ease-out),
                border-color var(--dur-fast) var(--ease-out),
                box-shadow var(--dur-fast) var(--ease-out),
                transform var(--dur-fast) var(--ease-out);
    -webkit-font-smoothing: antialiased;
    user-select: none;
  }
  .dn-btn:focus-visible { outline: none; box-shadow: var(--ring); }
  .dn-btn:active:not(:disabled) { transform: translateY(1px); }
  .dn-btn:disabled { opacity: 0.42; cursor: not-allowed; }
  .dn-btn--block { width: 100%; }

  /* sizes */
  .dn-btn--sm { font-size: var(--text-xs); padding: 6px 10px; }
  .dn-btn--md { font-size: var(--text-sm); padding: 9px 14px; }
  .dn-btn--lg { font-size: var(--text-base); padding: 12px 20px; }

  /* primary — phosphor green fill, glow on hover */
  .dn-btn--primary {
    --_bg: var(--green); --_fg: var(--text-on-accent); --_bd: var(--green);
    font-weight: var(--weight-semibold);
  }
  .dn-btn--primary:hover:not(:disabled) {
    --_bg: var(--green-bright); --_bd: var(--green-bright);
    box-shadow: var(--glow-green);
  }

  /* secondary — bordered, fills on hover */
  .dn-btn--secondary { --_bg: var(--surface-2); --_fg: var(--text-primary); --_bd: var(--border-strong); }
  .dn-btn--secondary:hover:not(:disabled) { --_bg: var(--surface-3); --_bd: var(--green-dim); --_fg: var(--green-bright); }

  /* ghost — no chrome until hover */
  .dn-btn--ghost { --_bg: transparent; --_fg: var(--text-secondary); --_bd: transparent; }
  .dn-btn--ghost:hover:not(:disabled) { --_bg: var(--surface-2); --_fg: var(--text-primary); }

  /* danger */
  .dn-btn--danger { --_bg: transparent; --_fg: var(--red); --_bd: var(--red-dim); }
  .dn-btn--danger:hover:not(:disabled) { --_bg: var(--red-deep); --_fg: var(--red-bright); --_bd: var(--red); }

  .dn-btn__spinner {
    width: 1em; height: 1em; border-radius: 50%;
    border: 2px solid currentColor; border-top-color: transparent;
    animation: diane-spin 0.7s linear infinite;
  }
  .dn-btn__icon { display: inline-flex; font-size: 1.05em; }
  `;
  document.head.appendChild(el);
}

export function Button({
  children,
  variant = 'secondary',
  size = 'md',
  block = false,
  loading = false,
  disabled = false,
  leadingIcon = null,
  trailingIcon = null,
  type = 'button',
  className = '',
  ...rest
}) {
  useStyles();
  const cls = [
    'dn-btn',
    `dn-btn--${variant}`,
    `dn-btn--${size}`,
    block ? 'dn-btn--block' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <button type={type} className={cls} disabled={disabled || loading} {...rest}>
      {loading && <span className="dn-btn__spinner" aria-hidden="true" />}
      {!loading && leadingIcon && <span className="dn-btn__icon">{leadingIcon}</span>}
      {children}
      {!loading && trailingIcon && <span className="dn-btn__icon">{trailingIcon}</span>}
    </button>
  );
}
