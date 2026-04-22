import React from 'react'
import { X, WarningCircle } from '@phosphor-icons/react'

// ─────────────────────────────────────────────
// PAGE HEADER
// ─────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--gray-900)', lineHeight: 1.3 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 2 }}>{subtitle}</p>}
      </div>
      {action && <div style={{ flexShrink: 0 }}>{action}</div>}
    </div>
  )
}

// ─────────────────────────────────────────────
// BUTTON
// ─────────────────────────────────────────────
export function Button({ children, variant = 'primary', size = 'md', onClick, type = 'button', disabled, style: extraStyle }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontWeight: 600, borderRadius: 'var(--radius-md)',
    transition: 'all .15s', fontSize: size === 'sm' ? 13 : 14,
    padding: size === 'sm' ? '6px 12px' : '9px 18px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  }
  const variants = {
    primary: { background: 'var(--green-500)', color: '#fff', border: 'none' },
    secondary: { background: '#fff', color: 'var(--gray-700)', border: '1px solid var(--gray-300)' },
    danger: { background: 'var(--red-500)', color: '#fff', border: 'none' },
    ghost: { background: 'transparent', color: 'var(--gray-600)', border: '1px solid transparent' },
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...extraStyle }}
      onMouseEnter={e => {
        if (disabled) return
        if (variant === 'primary') e.currentTarget.style.background = 'var(--green-600)'
        if (variant === 'secondary') e.currentTarget.style.background = 'var(--gray-50)'
        if (variant === 'danger') e.currentTarget.style.background = 'var(--red-600)'
      }}
      onMouseLeave={e => {
        if (disabled) return
        e.currentTarget.style.background = variants[variant].background
      }}
    >
      {children}
    </button>
  )
}

// ─────────────────────────────────────────────
// FORM FIELD
// ─────────────────────────────────────────────
export function FormField({ label, error, children, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>
        {label} {required && <span style={{ color: 'var(--red-500)' }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: 12, color: 'var(--red-600)', display: 'flex', alignItems: 'center', gap: 4 }}>
          <WarningCircle size={13} /> {error}
        </span>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────
// INPUT
// ─────────────────────────────────────────────
export function Input({ type = 'text', value, onChange, placeholder, name, required, min, style: extra }) {
  return (
    <input
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} name={name} required={required} min={min}
      style={{
        padding: '8px 12px', borderRadius: 'var(--radius-sm)',
        border: '1.5px solid var(--gray-300)', fontSize: 14,
        color: 'var(--gray-900)', background: '#fff',
        transition: 'border .15s', width: '100%', ...extra,
      }}
      onFocus={e => e.target.style.borderColor = 'var(--green-500)'}
      onBlur={e => e.target.style.borderColor = 'var(--gray-300)'}
    />
  )
}

// ─────────────────────────────────────────────
// SELECT
// ─────────────────────────────────────────────
export function Select({ value, onChange, name, children, style: extra }) {
  return (
    <select
      value={value} onChange={onChange} name={name}
      style={{
        padding: '8px 12px', borderRadius: 'var(--radius-sm)',
        border: '1.5px solid var(--gray-300)', fontSize: 14,
        color: 'var(--gray-900)', background: '#fff', width: '100%',
        cursor: 'pointer', ...extra,
      }}
      onFocus={e => e.target.style.borderColor = 'var(--green-500)'}
      onBlur={e => e.target.style.borderColor = 'var(--gray-300)'}
    >
      {children}
    </select>
  )
}

// ─────────────────────────────────────────────
// TEXTAREA
// ─────────────────────────────────────────────
export function Textarea({ value, onChange, name, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value} onChange={onChange} name={name}
      placeholder={placeholder} rows={rows}
      style={{
        padding: '8px 12px', borderRadius: 'var(--radius-sm)',
        border: '1.5px solid var(--gray-300)', fontSize: 14,
        color: 'var(--gray-900)', background: '#fff',
        resize: 'vertical', width: '100%',
      }}
      onFocus={e => e.target.style.borderColor = 'var(--green-500)'}
      onBlur={e => e.target.style.borderColor = 'var(--gray-300)'}
    />
  )
}

// ─────────────────────────────────────────────
// MODAL
// ─────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 500 }) {
  if (!open) return null
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100, padding: 16,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 'var(--radius-lg)',
        width: '100%', maxWidth: width,
        boxShadow: '0 20px 60px rgba(0,0,0,.15)',
        maxHeight: '90dvh', display: 'flex', flexDirection: 'column',
      }}>
        {/* Modal header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 20px 16px', borderBottom: '1px solid var(--gray-100)',
        }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', padding: 4, borderRadius: 6, display: 'flex', color: 'var(--gray-400)' }}
          >
            <X size={20} />
          </button>
        </div>
        {/* Modal body */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// TABLE
// ─────────────────────────────────────────────
export function Table({ headers, children, loading }) {
  return (
    <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
        <thead>
          <tr style={{ background: 'var(--gray-50)' }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                padding: '10px 14px', textAlign: 'left',
                fontWeight: 600, fontSize: 12, color: 'var(--gray-500)',
                letterSpacing: '.04em', textTransform: 'uppercase',
                borderBottom: '1px solid var(--gray-200)',
                whiteSpace: 'nowrap',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={headers.length} style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
                <SkeletonRows count={4} cols={headers.length} />
              </td>
            </tr>
          ) : children}
        </tbody>
      </table>
    </div>
  )
}

export function Tr({ children, onClick }) {
  return (
    <tr
      onClick={onClick}
      style={{ borderBottom: '1px solid var(--gray-100)', cursor: onClick ? 'pointer' : 'default' }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.background = 'var(--gray-50)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </tr>
  )
}

export function Td({ children, align = 'left', muted }) {
  return (
    <td style={{
      padding: '12px 14px', color: muted ? 'var(--gray-400)' : 'var(--gray-700)',
      textAlign: align, fontFamily: typeof children === 'number' ? 'var(--font-mono)' : 'inherit',
      fontSize: 14,
    }}>
      {children}
    </td>
  )
}

// ─────────────────────────────────────────────
// SKELETON ROWS
// ─────────────────────────────────────────────
function SkeletonRows({ count = 3, cols = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, ri) => (
        <tr key={ri} style={{ borderBottom: '1px solid var(--gray-100)' }}>
          {Array.from({ length: cols }).map((_, ci) => (
            <td key={ci} style={{ padding: '12px 14px' }}>
              <div style={{
                height: 14, borderRadius: 4,
                background: 'linear-gradient(90deg, var(--gray-100) 25%, var(--gray-200) 50%, var(--gray-100) 75%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                width: ci === 0 ? 32 : ci === cols - 1 ? 60 : '80%',
              }} />
            </td>
          ))}
        </tr>
      ))}
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </>
  )
}

// ─────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────
export function Badge({ children, color = 'gray' }) {
  const colors = {
    green: { bg: 'var(--green-50)', text: 'var(--green-700)' },
    red:   { bg: 'var(--red-50)',   text: 'var(--red-600)' },
    amber: { bg: 'var(--amber-50)', text: '#92400E' },
    gray:  { bg: 'var(--gray-100)', text: 'var(--gray-600)' },
  }
  const c = colors[color] || colors.gray
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px',
      borderRadius: 999, fontSize: 12, fontWeight: 600,
      background: c.bg, color: c.text,
    }}>
      {children}
    </span>
  )
}

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────
export function EmptyState({ title, subtitle, action }) {
  return (
    <tr>
      <td colSpan={99}>
        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
          <p style={{ fontWeight: 600, color: 'var(--gray-700)', marginBottom: 4 }}>{title}</p>
          {subtitle && <p style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 16 }}>{subtitle}</p>}
          {action}
        </div>
      </td>
    </tr>
  )
}

// ─────────────────────────────────────────────
// ALERT
// ─────────────────────────────────────────────
export function Alert({ type = 'error', children }) {
  const colors = {
    error:   { bg: 'var(--red-50)',   border: 'var(--red-500)',   text: 'var(--red-700)' },
    success: { bg: 'var(--green-50)', border: 'var(--green-500)', text: 'var(--green-700)' },
  }
  const c = colors[type]
  return (
    <div style={{
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: 'var(--radius-md)', padding: '10px 14px',
      fontSize: 13, color: c.text, fontWeight: 500,
    }}>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────
// FORMAT RUPIAH
// ─────────────────────────────────────────────
export function formatRupiah(amount) {
  return `Rp ${Number(amount).toLocaleString('id-ID')}`
}
