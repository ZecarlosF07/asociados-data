const VARIANTS = {
  default: 'badge-default',
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
}

export function Badge({ children, variant = 'default', className = '' }) {
  const classes = ['badge', VARIANTS[variant], className]
    .filter(Boolean)
    .join(' ')

  return <span className={classes}>{children}</span>
}
