export function MembershipCategoryField({ category }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
        {category?.code || '—'}
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Categoría de la empresa</p>
        <p className="truncate text-sm font-semibold text-slate-900">
          {category ? category.name || category.code : 'Sin categoría asignada'}
        </p>
        <p className="text-xs text-slate-500">Se toma automáticamente de Información.</p>
      </div>
    </div>
  )
}
