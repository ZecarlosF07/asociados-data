import { formatCurrency } from '../../../utils/helpers'
import { MONTH_NAMES } from '../../../utils/paymentScheduleUtils'

export function PendingPaymentsSummary({
  filteredCount,
  overdueCount,
  paidCount,
  selectedMonth,
  selectedYear,
  showAllMonths,
  totalAmount,
  totalOverdue,
  viewMode,
}) {
  if (filteredCount === 0) return null

  if (viewMode === 'paid') {
    return (
      <SummaryGrid>
        <SummaryCard
          label={showAllMonths ? 'Total pagado' : `Pagado ${MONTH_NAMES[selectedMonth - 1]}`}
          value={formatCurrency(totalAmount)}
          accent="text-emerald-700"
        />
        <SummaryCard label="Cuotas pagadas" value={String(paidCount)} />
        <SummaryCard
          label="Filtro"
          value={showAllMonths ? 'Todos' : `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
        />
        <SummaryCard label="Vista" value="Pagadas" accent="text-emerald-700" />
      </SummaryGrid>
    )
  }

  return (
    <SummaryGrid>
      <SummaryCard
        label={showAllMonths ? 'Total pendiente' : `Pendiente ${MONTH_NAMES[selectedMonth - 1]}`}
        value={formatCurrency(totalAmount)}
      />
      <SummaryCard label="Cuotas" value={String(filteredCount)} />
      <SummaryCard
        label="Vencidas"
        value={String(overdueCount)}
        accent="text-red-600"
      />
      <SummaryCard
        label="Monto vencido"
        value={formatCurrency(totalOverdue)}
        accent="text-red-600"
      />
    </SummaryGrid>
  )
}

function SummaryGrid({ children }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {children}
    </div>
  )
}

function SummaryCard({ label, value, accent = 'text-slate-900' }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}
