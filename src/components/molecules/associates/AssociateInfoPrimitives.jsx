export function InfoSection({ children, title }) {
  return (
    <div>
      <h3 className="mb-3 border-b border-slate-100 pb-1 text-sm font-bold text-slate-700">{title}</h3>
      <div className="grid grid-cols-1 gap-x-6 gap-y-2 md:grid-cols-2">{children}</div>
    </div>
  )
}

export function InfoRow({ children, label, value }) {
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="min-w-[140px] font-medium text-slate-500">{label}:</span>
      <span className="text-slate-800">{children || value || '—'}</span>
    </div>
  )
}
