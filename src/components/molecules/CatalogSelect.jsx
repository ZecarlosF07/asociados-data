import { forwardRef } from 'react'
import { useCatalog } from '../../hooks/useCatalog'

export const CatalogSelect = forwardRef(function CatalogSelect(
  {
    groupCode,
    value,
    onChange,
    placeholder = 'Seleccionar...',
    disabled = false,
    hasError = false,
    className = '',
    ...rest
  },
  ref
) {
  const { items, loading } = useCatalog(groupCode)

  const base = 'w-full px-3 py-2 border rounded-md text-sm text-slate-900 bg-white outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70'
  const errorClass = hasError ? 'border-red-500' : 'border-slate-300'

  return (
    <select
      ref={ref}
      className={`${base} ${errorClass} ${className}`}
      value={value || ''}
      onChange={onChange}
      disabled={disabled || loading}
      {...rest}
    >
      <option value="">
        {loading ? 'Cargando...' : placeholder}
      </option>
      {items.map((item) => (
        <option key={item.id} value={item.id}>
          {item.label}
        </option>
      ))}
    </select>
  )
})
