import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../../atoms/Badge'
import { formatDate, formatCurrency } from '../../../utils/helpers'

/**
 * Tabla de datos para reportes con formato y truncamiento automático
 */
export function ReportTable({ columns, data, pageSize = 25, onRowClick }) {
  const [page, setPage] = useState(1)
  const totalRows = data?.length || 0
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize))

  useEffect(() => {
    setPage(1)
  }, [totalRows, pageSize])

  const displayData = useMemo(() => {
    const start = (page - 1) * pageSize
    return data?.slice(start, start + pageSize) || []
  }, [data, page, pageSize])

  if (!displayData.length) {
    return (
      <p className="text-sm text-slate-400 text-center py-8">
        Sin datos disponibles.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`py-2.5 px-4 text-xs font-semibold text-slate-500 ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayData.map((row, idx) => (
            <tr
              key={row.id || idx}
              className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                onRowClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`py-2.5 px-4 ${
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {renderCell(row, col)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {totalRows > pageSize && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Mostrando {(page - 1) * pageSize + 1}-
            {Math.min(page * pageSize, totalRows)} de {totalRows} registros
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-md disabled:opacity-40"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
            >
              Anterior
            </button>
            <span className="text-xs text-slate-500">
              Página {page} de {totalPages}
            </span>
            <button
              type="button"
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200 rounded-md disabled:opacity-40"
              disabled={page === totalPages}
              onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

function renderCell(row, col) {
  const value = getNestedValue(row, col.key)

  if (col.render) return col.render(value, row)

  if (col.format === 'date') return <span className="text-slate-600">{formatDate(value)}</span>
  if (col.format === 'currency') {
    return <span className="font-medium text-slate-900">{formatCurrency(value)}</span>
  }
  if (col.format === 'badge') {
    const variant = col.badgeVariant?.(value, row) || 'default'
    return <Badge variant={variant}>{value || '—'}</Badge>
  }
  if (col.format === 'boolean') {
    return value ? (
      <span className="text-green-600 font-semibold">✓</span>
    ) : (
      <span className="text-slate-300">—</span>
    )
  }

  return <span className="text-slate-600 truncate max-w-[200px] inline-block">{value ?? '—'}</span>
}
