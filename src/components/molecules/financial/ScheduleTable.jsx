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
              Esperado
            </th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">
              Pagado
            </th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">
              Saldo
            </th>
            <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => {
            const periodLabel = s.period_month
              ? `${String(s.period_month).padStart(2, '0')}/${s.period_year}`
              : String(s.period_year)

            const status = getScheduleStatus(s)

            return (
              <tr
                key={s.id}
                className={`border-b border-slate-100 ${
                  status.code === 'VENCIDO' ? 'bg-red-50/40' : ''
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
                <td className="py-2 px-3 text-right text-emerald-700">
                  {formatCurrency(s.paid_amount)}
                </td>
                <td className="py-2 px-3 text-right text-slate-900 font-semibold">
                  {formatCurrency(s.outstanding_amount)}
                </td>
                <td className="py-2 px-3 text-center">
                  <Badge variant={status.variant}>
                    {status.label}
                  </Badge>
                  {s.has_collection_management && status.code !== 'PAGADO' && (
                    <span className="ml-2 text-xs font-medium text-blue-700">En gestión</span>
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

function getScheduleStatus(schedule) {
  const statusCode = schedule.financial_status_code || schedule.collection_status?.code
  return {
    code: statusCode,
    label: schedule.financial_status_label || schedule.collection_status?.label || '—',
    variant: COLLECTION_STATUS_VARIANT[statusCode] || 'default',
  }
}
