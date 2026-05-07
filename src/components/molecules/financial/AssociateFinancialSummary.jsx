import { Badge } from '../../atoms/Badge'
import { formatCurrency, formatDate, formatDateTime } from '../../../utils/helpers'

export function AssociateFinancialSummary({
  associate,
  schedules = [],
  payments = [],
  collectionActions = [],
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const paidBySchedule = payments
    .filter((payment) => !payment.is_reversed)
    .reduce((acc, payment) => {
      if (!payment.payment_schedule_id) return acc
      acc[payment.payment_schedule_id] =
        (acc[payment.payment_schedule_id] || 0) + Number(payment.amount_paid || 0)
      return acc
    }, {})

  const activeSchedules = schedules.filter((schedule) => !schedule.is_paid)
  const getOutstanding = (schedule) => Math.max(
    Number(schedule.expected_amount || 0) - Number(paidBySchedule[schedule.id] || 0),
    0
  )

  const overdueSchedules = activeSchedules.filter(
    (schedule) => new Date(schedule.due_date) < today
  )
  const upcomingSchedules = activeSchedules
    .filter((schedule) => new Date(schedule.due_date) >= today)
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))

  const totalPending = activeSchedules.reduce(
    (sum, schedule) => sum + getOutstanding(schedule),
    0
  )
  const totalOverdue = overdueSchedules.reduce(
    (sum, schedule) => sum + getOutstanding(schedule),
    0
  )
  const totalPaid = payments
    .filter((payment) => !payment.is_reversed)
    .reduce((sum, payment) => sum + Number(payment.amount_paid || 0), 0)

  const nextDue = upcomingSchedules[0]
  const lastCollectionAction = collectionActions[0]

  return (
    <div className="space-y-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-700">
          Resumen financiero
        </h3>
        <Badge variant={getHealthVariant(associate?.payment_health?.code)}>
          {associate?.payment_health?.label || 'Sin estado'}
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryMetric
          label="Pendiente"
          value={formatCurrency(totalPending)}
          tone="text-slate-900"
        />
        <SummaryMetric
          label="Vencido"
          value={formatCurrency(totalOverdue)}
          tone="text-red-600"
        />
        <SummaryMetric
          label="Pagado"
          value={formatCurrency(totalPaid)}
          tone="text-emerald-600"
        />
        <SummaryMetric
          label="Cuotas vencidas"
          value={String(overdueSchedules.length)}
          tone={overdueSchedules.length > 0 ? 'text-red-600' : 'text-slate-900'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SummaryMetric
          label="Próximo cobro"
          value={nextDue ? formatDate(nextDue.due_date) : 'Sin pendientes'}
          tone="text-slate-900"
        />
        <SummaryMetric
          label="Última gestión"
          value={
            lastCollectionAction
              ? formatDateTime(lastCollectionAction.action_date)
              : 'Sin gestiones'
          }
          detail={lastCollectionAction?.subject}
          tone="text-slate-900"
        />
      </div>
    </div>
  )
}

function SummaryMetric({ label, value, detail, tone }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
      <p className={`text-lg font-bold ${tone}`}>{value}</p>
      {detail && (
        <p className="text-xs text-slate-400 mt-1 truncate">{detail}</p>
      )}
    </div>
  )
}

function getHealthVariant(code) {
  if (code === 'AL_DIA') return 'success'
  if (code === 'POR_VENCER') return 'warning'
  if (code === 'MOROSO' || code === 'CRITICO') return 'danger'
  return 'default'
}
