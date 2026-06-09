import React from 'react';

const STYLE_ID = 'dn-field-styles';
function useStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = STYLE_ID;
  el.textContent = `
  .dn-field { display: flex; flex-direction: column; gap: 6px; }
  .dn-field__label {
    font-family: var(--font-mono); font-size: var(--text-2xs);
    text-transform: uppercase; letter-spacing: var(--tracking-caps);
    color: var(--text-secondary);
    display: flex; align-items: center; gap: var(--space-2);
  }
  .dn-field__req { color: var(--green); }
  .dn-field__wrap {
    display: flex; align-items: stretch;
    background: var(--surface-inset);
    border: var(--border-hairline) solid var(--border-default);
    border-radius: var(--radius-md);
    transition: border-color var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out);
    overflow: hidden;
  }
  .dn-field__wrap:focus-within { border-color: var(--green-dim); box-shadow: var(--glow-green); }
  .dn-field__wrap--error { border-color: var(--red-dim); }
  .dn-field__wrap--error:focus-within { box-shadow: var(--glow-red); }
  .dn-field__prefix {
    display: flex; align-items: center; padding: 0 0 0 12px;
    font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-muted);
    user-select: none;
  }
  .dn-field__input, .dn-field__textarea {
    flex: 1; width: 100%;
    appearance: none; background: transparent; border: none; outline: none;
    color: var(--text-primary);
    font-family: var(--font-mono); font-size: var(--text-sm);
    padding: 10px 12px;
  }
  .dn-field__textarea { font-family: var(--font-sans); line-height: var(--leading-relaxed); resize: vertical; min-height: 92px; }
  .dn-field__input::placeholder, .dn-field__textarea::placeholder { color: var(--text-faint); }
  .dn-field__input:disabled, .dn-field__textarea:disabled { color: var(--text-muted); cursor: not-allowed; }
  .dn-field__help { font-family: var(--font-sans); font-size: var(--text-xs); color: var(--text-muted); }
  .dn-field__help--error { color: var(--red-bright); font-family: var(--font-mono); }
  `;
  document.head.appendChild(el);
}

export function TextField({
  label,
  value,
  onChange = () => {},
  placeholder = '',
  multiline = false,
  rows = 4,
  prefix = null,
  type = 'text',
  required = false,
  disabled = false,
  error = '',
  help = '',
  id,
  className = '',
  ...rest
}) {
  useStyles();
  const handle = (e) => onChange(e.target.value, e);
  return (
    <label className={['dn-field', className].filter(Boolean).join(' ')} htmlFor={id}>
      {label && (
        <span className="dn-field__label">
          {label}{required && <span className="dn-field__req">*</span>}
        </span>
      )}
      <span className={`dn-field__wrap${error ? ' dn-field__wrap--error' : ''}`}>
        {prefix && <span className="dn-field__prefix">{prefix}</span>}
        {multiline ? (
          <textarea
            id={id} className="dn-field__textarea" value={value} placeholder={placeholder}
            rows={rows} disabled={disabled} onChange={handle} {...rest}
          />
        ) : (
          <input
            id={id} className="dn-field__input" type={type} value={value} placeholder={placeholder}
            disabled={disabled} onChange={handle} {...rest}
          />
        )}
      </span>
      {(error || help) && (
        <span className={`dn-field__help${error ? ' dn-field__help--error' : ''}`}>{error || help}</span>
      )}
    </label>
  );
}
