import React from 'react';

const STYLE_ID = 'dn-card-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-card {
    background: var(--surface-1);
    border: var(--border-hairline) solid var(--border-subtle);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-panel);
    overflow: hidden;
  }
  .dn-card--flush { box-shadow: none; }
  .dn-card__bar {
    display: flex; align-items: center; gap: var(--space-3);
    padding: 10px var(--space-4);
    border-bottom: var(--border-hairline) solid var(--border-subtle);
    background: linear-gradient(var(--surface-2), var(--surface-1));
  }
  .dn-card__dots { display: inline-flex; gap: 6px; }
  .dn-card__dot { width: 9px; height: 9px; border-radius: 50%; background: var(--border-strong); }
  .dn-card__title {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-secondary);
    letter-spacing: var(--tracking-wide);
    margin: 0;
    flex: 1; min-width: 0;
    overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }
  .dn-card__title b { color: var(--text-primary); font-weight: var(--weight-semibold); }
  .dn-card__actions { display: inline-flex; align-items: center; gap: var(--space-2); }
  .dn-card__body { padding: var(--space-5); }
  .dn-card__body--flush { padding: 0; }
  `;
  document.head.appendChild(el);
}

export function Card({
  children,
  title = null,
  terminalDots = false,
  actions = null,
  flushBody = false,
  shadow = true,
  className = '',
  bodyClassName = '',
  ...rest
}) {
  useStyles();
  const cls = ['dn-card', shadow ? '' : 'dn-card--flush', className].filter(Boolean).join(' ');
  const hasBar = title != null || terminalDots || actions != null;
  return (
    <section className={cls} {...rest}>
      {hasBar && (
        <header className="dn-card__bar">
          {terminalDots && (
            <span className="dn-card__dots" aria-hidden="true">
              <span className="dn-card__dot" /><span className="dn-card__dot" /><span className="dn-card__dot" />
            </span>
          )}
          {title != null && <p className="dn-card__title">{title}</p>}
          {actions != null && <span className="dn-card__actions">{actions}</span>}
        </header>
      )}
      <div className={`dn-card__body${flushBody ? ' dn-card__body--flush' : ''} ${bodyClassName}`.trim()}>
        {children}
      </div>
    </section>
  );
}
