import { Loader } from '../../atoms/Loader'
import { PendingPaymentsEmptyState } from './PendingPaymentsEmptyState'
import { PendingPaymentScheduleSection } from './PendingPaymentScheduleSection'

export function PendingPaymentsContent({
  canManageCollections,
  navigateToAssociate,
  pendingPayments,
}) {
  if (pendingPayments.loading) return <LoadingState />
  if (pendingPayments.filtered.length === 0) {
    return <PendingPaymentsEmptyState pendingPayments={pendingPayments} />
  }

  if (pendingPayments.viewMode === 'paid') {
    return (
      <PaymentSection
        title={`Pagadas (${pendingPayments.paid.length})`}
        items={pendingPayments.paid}
        variant="success"
        canEdit={false}
        showPaidAt
        navigateToAssociate={navigateToAssociate}
        pendingPayments={pendingPayments}
      />
    )
  }

  return (
    <div className="space-y-6">
      {pendingPayments.overdue.length > 0 && (
        <PaymentSection
          title={`Vencidas (${pendingPayments.overdue.length})`}
          items={pendingPayments.overdue}
          variant="danger"
          canEdit={canManageCollections}
          navigateToAssociate={navigateToAssociate}
          pendingPayments={pendingPayments}
        />
      )}
      {pendingPayments.upcoming.length > 0 && (
        <PaymentSection
          title={`Próximas (${pendingPayments.upcoming.length})`}
          items={pendingPayments.upcoming}
          variant="warning"
          canEdit={canManageCollections}
          navigateToAssociate={navigateToAssociate}
          pendingPayments={pendingPayments}
        />
      )}
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader />
    </div>
  )
}

function PaymentSection({
  title,
  items,
  variant,
  canEdit,
  showPaidAt = false,
  navigateToAssociate,
  pendingPayments,
}) {
  return (
    <PendingPaymentScheduleSection
      title={title}
      items={items}
      variant={variant}
      canEdit={canEdit}
      showPaidAt={showPaidAt}
      activePaymentRow={pendingPayments.activePaymentRow}
      activeCollectionRow={pendingPayments.activeCollectionRow}
      actionLoading={pendingPayments.actionLoading}
      onNavigate={navigateToAssociate}
      onPayClick={pendingPayments.handlePayClick}
      onCollectionClick={pendingPayments.handleCollectionClick}
      onPaymentSubmit={pendingPayments.handlePaymentSubmit}
      onCollectionSubmit={pendingPayments.handleCollectionSubmit}
    />
  )
}
