import { EmptyState } from '../../atoms/EmptyState'
import { MONTH_NAMES } from '../../../utils/paymentScheduleUtils'

export function PendingPaymentsEmptyState({ pendingPayments }) {
  const { search, selectedMonth, selectedYear, showAllMonths, viewMode } =
    pendingPayments

  return (
    <EmptyState
      icon="✅"
      title={viewMode === 'paid' ? 'Sin cuotas pagadas' : 'Sin cuotas pendientes'}
      description={getEmptyStateDescription({
        search,
        selectedMonth,
        selectedYear,
        showAllMonths,
        viewMode,
      })}
    />
  )
}

function getEmptyStateDescription({
  search,
  selectedMonth,
  selectedYear,
  showAllMonths,
  viewMode,
}) {
  if (showAllMonths && search) return 'No se encontraron cuotas para esa búsqueda.'
  if (showAllMonths && viewMode === 'paid') return 'No hay cuotas pagadas registradas.'
  if (showAllMonths) return 'Todos los asociados están al día.'

  const status = viewMode === 'paid' ? 'pagadas' : 'pendientes'
  const month = MONTH_NAMES[selectedMonth - 1]
  return `No hay cuotas ${status} en ${month} ${selectedYear}.`
}
