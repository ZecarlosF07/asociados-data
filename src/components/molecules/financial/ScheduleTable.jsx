import { Badge } from '../../atoms/Badge'
import { formatDate, formatCurrency } from '../../../utils/helpers'
import { COLLECTION_STATUS_VARIANT } from '../../../utils/financialConstants'

export function ScheduleTable({ schedules }) {
  if (schedules.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-6">
        No hay cronograma generado.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">
              Período
            </th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">
              Vencimiento
            </th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">
              Monto
            </th>
            <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500">
              Estado
            </th>
            <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500">
              Pagado
            </th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => {
            const statusCode = s.collection_status?.code
            const variant = COLLECTION_STATUS_VARIANT[statusCode] || 'default'
            const periodLabel = s.period_month
              ? `${String(s.period_month).padStart(2, '0')}/${s.period_year}`
              : String(s.period_year)

            const isOverdue =
              !s.is_paid && new Date(s.due_date) < new Date()

            return (
              <tr
                key={s.id}
                className={`border-b border-slate-100 ${
                  isOverdue ? 'bg-red-50/40' : ''
                }`}
              >
                <td className="py-2 px-3 text-slate-800 font-medium">
                  {periodLabel}
                </td>
                <td className="py-2 px-3 text-slate-600">
                  {formatDate(s.due_date)}
                </td>
                <td className="py-2 px-3 text-right text-slate-800 font-medium">
                  {formatCurrency(s.expected_amount)}
                </td>
                <td className="py-2 px-3 text-center">
                  <Badge variant={variant}>
                    {s.collection_status?.label || '—'}
                  </Badge>
                </td>
                <td className="py-2 px-3 text-center">
                  {s.is_paid ? (
                    <span className="text-green-600 font-semibold">✓</span>
                  ) : isOverdue ? (
                    <span className="text-red-500 font-semibold text-xs">
                      Vencido
                    </span>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
