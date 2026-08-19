export default function ActionButton({ icon: Icon, children, active, variant = 'default', iconOnly = false, ...props }) {
  const variantStyles = {
    default: { border: '2px solid var(--border)', background: 'var(--surface-raised)' },
    accent: { border: '2px solid var(--accent)', background: 'var(--surface-raised)' },
    danger: { border: `2px solid ${active ? 'var(--danger)' : 'var(--border)'}`, background: 'var(--surface-raised)' },
    ghost: { border: 'none', background: 'transparent', color: 'var(--accent)', textDecoration: 'underline' },
  }
  return (
    <button
      {...props}
      title={iconOnly ? children : undefined}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: iconOnly ? 0 : '8px',
        padding: iconOnly ? 0 : '0 var(--space-md)',
        width: iconOnly ? '3.5rem' : undefined,
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-primary)',
        fontWeight: 600,
        whiteSpace: 'nowrap',
        ...variantStyles[variant],
        ...props.style,
      }}
    >
      {Icon && <Icon size={20} aria-hidden="true" />}
      <span className={iconOnly ? 'sr-only' : undefined}>{children}</span>
    </button>
  )
}
