/**
 * ActionButton
 * Every button in the app renders through this, so sizing, spacing,
 * and icon+label pairing stay consistent instead of one-off inline
 * styles scattered across App.jsx. Icon is aria-hidden -- the visible
 * text label is what screen readers announce, never the icon alone.
 *
 * Color is set EXPLICITLY on both the icon and the text span below,
 * rather than relying on CSS inheritance (currentColor) -- inheritance
 * is fragile across nested elements and made the Stop button's text
 * hard to see. Explicit color removes that ambiguity entirely.
 */
export default function ActionButton({ icon: Icon, children, active, variant = 'default', ...props }) {
  const variantStyles = {
    default: { border: '2px solid var(--border)', background: 'var(--surface-raised)', color: 'var(--text-primary)' },
    accent: { border: '2px solid var(--accent)', background: 'var(--surface-raised)', color: 'var(--text-primary)' },
    danger: {
      border: `2px solid ${active ? 'var(--danger)' : 'var(--border)'}`,
      background: 'var(--surface-raised)',
      color: 'var(--text-primary)',
    },
    // Solid deep-red fill + white text -- deliberately the most visually
    // distinct button in the app, since Stop is a safety-critical action
    stop: { border: '2px solid var(--danger-solid)', background: 'var(--danger-solid)', color: '#ffffff' },
    ghost: { border: 'none', background: 'transparent', color: 'var(--accent)', textDecoration: 'underline' },
  }

  const resolved = variantStyles[variant]

  return (
    <button
      {...props}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '0 var(--space-md)',
        borderRadius: 'var(--radius-sm)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        ...resolved,
        ...props.style,
      }}
    >
      {Icon && <Icon size={20} color={resolved.color} aria-hidden="true" />}
      <span style={{ color: resolved.color }}>{children}</span>
    </button>
  )
}