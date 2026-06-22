import { useNavigate } from 'react-router-dom'
import { PendingPaymentsContent } from '../../components/molecules/financial/PendingPaymentsContent'
import { PendingPaymentsFilters } from '../../components/molecules/financial/PendingPaymentsFilters'
import { PendingPaymentsSummary } from '../../components/molecules/financial/PendingPaymentsSummary'
import { Button } from '../../components/atoms/Button'
import { useNotification } from '../../hooks/useNotification'
import { usePendingPayments } from '../../hooks/usePendingPayments'
import { usePermissions } from '../../hooks/usePermissions'
import { useUserProfile } from '../../hooks/useUserProfile'
import { ROUTES } from '../../router/routes'
import { exportToExcel, EXPORT_COLUMNS } from '../../utils/exportUtils'
import { getScheduleDisplayStatus, getSchedulePeriodLabel } from '../../utils/paymentScheduleUtils'
import { todayDateOnly } from '../../utils/dateOnly'

export function PendingPaymentsPage() {
  const navigate = useNavigate()
  const { profile } = useUserProfile()
  const { notify } = useNotification()
  const { canCreate, canEdit } = usePermissions()
  const canManageCollections = canCreate('cobranza') && canEdit('cobranza')
  const pendingPayments = usePendingPayments({ profile, notify })

  const handleExport = async () => {
    try {
      await exportToExcel({
        filename: `cobranza_filtrada_${todayDateOnly()}`,
        sheetName: pendingPayments.viewMode === 'paid' ? 'Pagadas' : 'Pendientes',
        data: pendingPayments.filtered.map(buildExportRow),
        columns: EXPORT_COLUMNS.collectionSchedules,
      })
      notify.success('Excel exportado correctamente')
    } catch (error) {
      notify.error(`No se pudo exportar: ${error.message}`)
    }
  }

  const navigateToAssociate = (id) => {
    navigate(`${ROUTES.ASOCIADOS}/${id}`)
  }

  return (
    <div className="max-w-6xl">
      <PageHeader
        exportDisabled={pendingPayments.loading || pendingPayments.filtered.length === 0}
        onExport={handleExport}
      />

      <PendingPaymentsFilters
        selectedMonth={pendingPayments.selectedMonth}
        selectedYear={pendingPayments.selectedYear}
        showAllMonths={pendingPayments.showAllMonths}
        viewMode={pendingPayments.viewMode}
        search={pendingPayments.search}
        paymentTypeId={pendingPayments.paymentTypeId}
        onPrevMonth={pendingPayments.handlePrevMonth}
        onNextMonth={pendingPayments.handleNextMonth}
        onCurrentMonth={pendingPayments.handleCurrentMonth}
        onToggleAllMonths={() =>
          pendingPayments.setShowAllMonths(!pendingPayments.showAllMonths)
        }
        onToggleViewMode={pendingPayments.handleViewModeToggle}
        onSearchChange={pendingPayments.setSearch}
        onPaymentTypeChange={pendingPayments.setPaymentTypeId}
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

function PageHeader({ exportDisabled, onExport }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Cobranza</h1>
        <p className="text-sm text-slate-400">
          Cuotas pendientes y pagadas, filtradas por vencimiento mensual.
        </p>
      </div>
      <Button size="sm" variant="secondary" disabled={exportDisabled} onClick={onExport}>
        📥 Exportar Excel
      </Button>
    </div>
  )
}

function buildExportRow(schedule) {
  return {
    ...schedule,
    payment_type: schedule.membership?.membership_type?.label || 'Sin tipo',
    period: getSchedulePeriodLabel(schedule),
    status: getScheduleDisplayStatus(schedule).label,
  }
}
