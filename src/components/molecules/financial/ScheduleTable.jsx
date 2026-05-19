import { Badge } from '../../atoms/Badge'
import { formatDate, formatCurrency } from '../../../utils/helpers'
import { COLLECTION_STATUS_VARIANT } from '../../../utils/financialConstants'
import {
  addDaysToDateOnly,
  isBeforeDateOnly,
  todayDateOnly,
} from '../../../utils/dateOnly'

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
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => {
            const periodLabel = s.period_month
              ? `${String(s.period_month).padStart(2, '0')}/${s.period_year}`
              : String(s.period_year)

            const isOverdue =
              !s.is_paid && isBeforeDateOnly(s.due_date, todayDateOnly())
            const status = getScheduleStatus(s)

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
                  <Badge variant={status.variant}>
                    {status.label}
                  </Badge>
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
  const statusCode = schedule.collection_status?.code

  if (statusCode === 'ANULADO') {
    return buildCatalogStatus(schedule)
  }

  if (schedule.is_paid || statusCode === 'PAGADO') {
    return { label: 'Pagado', variant: 'success' }
  }

  if (statusCode === 'PARCIAL' || statusCode === 'EN_GESTION') {
    return buildCatalogStatus(schedule)
  }

  const today = todayDateOnly()
  if (isBeforeDateOnly(schedule.due_date, today)) {
    return { label: 'Vencido', variant: 'danger' }
  }

  const soonLimit = addDaysToDateOnly(today, 7)
  if (!isBeforeDateOnly(soonLimit, schedule.due_date)) {
    return { label: 'Por vencer', variant: 'warning' }
  }

  return { label: 'Pendiente', variant: 'default' }
}

function buildCatalogStatus(schedule) {
  const statusCode = schedule.collection_status?.code
  return {
    label: schedule.collection_status?.label || '—',
    variant: COLLECTION_STATUS_VARIANT[statusCode] || 'default',
  }
}
