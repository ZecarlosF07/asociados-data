import { Loader } from '../atoms/Loader'

export function DataTable({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'Sin registros',
  onRowClick,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 bg-white border border-slate-200 rounded-lg">
        <Loader />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-slate-400 bg-white border border-slate-200 rounded-lg">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto bg-white border border-slate-200 rounded-lg">
      <table className="w-full border-collapse">
        <thead className="border-b border-slate-200">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id || idx}
              className={`border-b border-slate-100 last:border-b-0 ${
                onRowClick
                  ? 'cursor-pointer hover:bg-slate-50 transition-colors'
                  : ''
              }`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-sm">
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
