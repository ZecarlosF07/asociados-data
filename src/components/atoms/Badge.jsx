const VARIANTS = {
  default: 'bg-slate-100 text-slate-500',
  success: 'bg-green-50 text-green-800',
  warning: 'bg-amber-50 text-amber-800',
  danger: 'bg-red-50 text-red-800',
  info: 'bg-blue-50 text-blue-800',
}

export function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-tight ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
