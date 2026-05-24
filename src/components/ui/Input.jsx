import { forwardRef } from 'react';

export const Input = forwardRef(function Input(
  { label, error, className = '', containerClass = '', prefix, suffix, type = 'text', style, ...props },
  ref
) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {label && (
        <label className="wf-label">{label}</label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {prefix && (
          <div style={{ position: 'absolute', left: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            {prefix}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`wf-input ${className}`}
          style={{
            paddingLeft: prefix ? 30 : undefined,
            paddingRight: suffix ? 30 : undefined,
            borderColor: error ? 'rgba(255,71,87,0.5)' : undefined,
            ...style,
          }}
          {...props}
        />
        {suffix && (
          <div style={{ position: 'absolute', right: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
            {suffix}
          </div>
        )}
      </div>
      {error && <p style={{ marginTop: 4, fontSize: 10, color: 'var(--red)' }}>{error}</p>}
    </div>
  );
});

export function Select({ label, error, className = '', children, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {label && <label className="wf-label">{label}</label>}
      <select
        className={`wf-input ${className}`}
        style={{
          cursor: 'pointer',
          borderColor: error ? 'rgba(255,71,87,0.5)' : undefined,
        }}
        {...props}
      >
        {children}
      </select>
      {error && <p style={{ marginTop: 4, fontSize: 10, color: 'var(--red)' }}>{error}</p>}
    </div>
  );
}
