import { useNavigate } from 'react-router-dom'
import { PendingPaymentsContent } from '../../components/molecules/financial/PendingPaymentsContent'
import { PendingPaymentsFilters } from '../../components/molecules/financial/PendingPaymentsFilters'
import { PendingPaymentsSummary } from '../../components/molecules/financial/PendingPaymentsSummary'
import { useNotification } from '../../hooks/useNotification'
import { usePendingPayments } from '../../hooks/usePendingPayments'
import { usePermissions } from '../../hooks/usePermissions'
import { useUserProfile } from '../../hooks/useUserProfile'
import { ROUTES } from '../../router/routes'

export function PendingPaymentsPage() {
  const navigate = useNavigate()
  const { profile } = useUserProfile()
  const { notify } = useNotification()
  const { canCreate, canEdit } = usePermissions()
  const canManageCollections = canCreate('cobranza') && canEdit('cobranza')
  const pendingPayments = usePendingPayments({ profile, notify })

  const navigateToAssociate = (id) => {
    navigate(`${ROUTES.ASOCIADOS}/${id}`)
  }

  return (
    <div className="max-w-6xl">
      <PageHeader />

      <PendingPaymentsFilters
        selectedMonth={pendingPayments.selectedMonth}
        selectedYear={pendingPayments.selectedYear}
        showAllMonths={pendingPayments.showAllMonths}
        viewMode={pendingPayments.viewMode}
        search={pendingPayments.search}
        onPrevMonth={pendingPayments.handlePrevMonth}
        onNextMonth={pendingPayments.handleNextMonth}
        onCurrentMonth={pendingPayments.handleCurrentMonth}
        onToggleAllMonths={() =>
          pendingPayments.setShowAllMonths(!pendingPayments.showAllMonths)
        }
        onToggleViewMode={pendingPayments.handleViewModeToggle}
        onSearchChange={pendingPayments.setSearch}
        onClearSearch={() => pendingPayments.setSearch('')}
      />

      {!pendingPayments.loading && (
        <PendingPaymentsSummary
          filteredCount={pendingPayments.filtered.length}
          overdueCount={pendingPayments.overdue.length}
          paidCount={pendingPayments.paid.length}
          selectedMonth={pendingPayments.selectedMonth}
          selectedYear={pendingPayments.selectedYear}
          showAllMonths={pendingPayments.showAllMonths}
          totalAmount={pendingPayments.totalAmount}
          totalOverdue={pendingPayments.totalOverdue}
          viewMode={pendingPayments.viewMode}
        />
      )}

      <PendingPaymentsContent
        canManageCollections={canManageCollections}
        navigateToAssociate={navigateToAssociate}
        pendingPayments={pendingPayments}
      />
    </div>
  )
}

function PageHeader() {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Cobranza</h1>
      <p className="text-sm text-slate-400">
        Cuotas pendientes y pagadas, filtradas por vencimiento mensual.
      </p>
    </div>
  )
}
