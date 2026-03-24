import { Badge } from '../../atoms/Badge'
import { formatDate, formatCurrency } from '../../../utils/helpers'

/**
 * Tabla de datos para reportes con formato y truncamiento automático
 */
export function ReportTable({ columns, data, maxRows = 100, onRowClick }) {
  const displayData = data?.slice(0, maxRows) || []

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

      {data?.length > maxRows && (
        <p className="text-xs text-slate-400 text-center py-3 border-t border-slate-100">
          Mostrando {maxRows} de {data.length} registros. Exporte a Excel para ver todos.
        </p>
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
