import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAssociateDetail } from '../../hooks/useAssociateDetail'
import { useNotification } from '../../hooks/useNotification'
import { useUserProfile } from '../../hooks/useUserProfile'
import { usePermissions } from '../../hooks/usePermissions'
import { useAssociateFinancialActions } from '../../hooks/useAssociateFinancialActions'
import { useAssociateCollectionActions } from '../../hooks/useAssociateCollectionActions'
import { useAssociateCommitteeActions } from '../../hooks/useAssociateCommitteeActions'
import { useAssociatePeopleActions } from '../../hooks/useAssociatePeopleActions'
import { useAssociateAreaContactActions } from '../../hooks/useAssociateAreaContactActions'
import { useAssociateDocumentActions } from '../../hooks/useAssociateDocumentActions'
import { AssociateDetailHeader } from './sections/AssociateDetailHeader'
import { AssociateDetailTabs } from './sections/AssociateDetailTabs'
import { AssociateCommitteeModal } from '../../components/molecules/associates/AssociateCommitteeModal'
import { ROUTES } from '../../router/routes'
import { AssociateDetailState } from './sections/AssociateDetailState'
import { associatesService } from '../../services/associates.service'

export function AssociateDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { profile } = useUserProfile()
  const { canCreate, canEdit } = usePermissions()
  const canEditAssociate = canEdit('asociados')
  const canCreateMembership = canCreate('membresias')
  const canUpdateMembership = canEdit('membresias')
  const canManageCollection = canCreate('cobranza') && canEdit('cobranza')
  const detail = useAssociateDetail(id)
  const [statusLoading, setStatusLoading] = useState(false)
  const committeeActions = useAssociateCommitteeActions({
    associateId: id,
    notify,
    refetch: detail.refetch,
  })
  const peopleActions = useAssociatePeopleActions({ associateId: id, notify, profile, refetch: detail.refetch })
  const contactActions = useAssociateAreaContactActions({ associateId: id, notify, profile, refetch: detail.refetch })
  const documentActions = useAssociateDocumentActions({ associateId: id, notify, profile, refetch: detail.refetch })
  const {
    financialLoading,
    handleMembershipSubmit,
    handleMembershipCancel,
    handleScheduledMembershipCancel,
    handleMembershipRenew,
    handlePaymentSubmit,
    handlePaymentReverse,
  } = useAssociateFinancialActions({
    associateId: id,
    notify,
    refetch: detail.refetch,
  })
  const {
    collectionLoading,
    handleCollectionSubmit,
  } = useAssociateCollectionActions({
    associateId: id,
    profile,
    notify,
    refetch: detail.refetch,
  })
  const handleSuspension = async () => {
    const suspended = detail.associate.associate_status?.code !== 'SUSPENDIDO'
    const message = suspended
      ? '¿Suspender a este asociado? La suspensión prevalecerá sobre su membresía.'
      : '¿Reactivar a este asociado? Su estado volverá a calcularse según la membresía.'
    if (!confirm(message)) return
    setStatusLoading(true)
    try {
      await associatesService.setSuspension(id, suspended)
      notify.success(suspended ? 'Asociado suspendido' : 'Estado automático restaurado')
      await detail.refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setStatusLoading(false)
    }
  }

  const isActionLoading = financialLoading || collectionLoading || committeeActions.loading
    || peopleActions.loading || contactActions.loading || documentActions.loading

  if (detail.loading || detail.error || !detail.associate) {
    return <AssociateDetailState loading={detail.loading} error={detail.error} onBack={() => navigate(ROUTES.ASOCIADOS)} />
  }

  return (
    <div className="max-w-6xl">
      <AssociateDetailHeader
        associate={detail.associate}
        canEdit={canEditAssociate}
        committeeActionLoading={committeeActions.loading}
        statusActionLoading={statusLoading}
        onEdit={() => navigate(`${ROUTES.ASOCIADOS}/${id}/editar`)}
        onBack={() => navigate(ROUTES.ASOCIADOS)}
        onManageCommittee={committeeActions.open}
        onToggleSuspension={handleSuspension}
      />

      <AssociateDetailTabs
        associate={detail.associate}
        people={detail.people}
        areaContacts={detail.areaContacts}
        memberships={detail.memberships}
        schedules={detail.schedules}
        payments={detail.payments}
        collectionActions={detail.collectionActions}
        documents={detail.documents}
        canEdit={canEditAssociate}
        canCreateMembership={canCreateMembership}
        canUpdateMembership={canUpdateMembership}
        canManageCollection={canManageCollection}
        canEditAssociate={canEditAssociate}
        onEditAssociate={() => navigate(`${ROUTES.ASOCIADOS}/${id}/editar`)}
        actionLoading={isActionLoading}
        onPersonSubmit={peopleActions.create}
        onPersonUpdate={peopleActions.update}
        onPersonDelete={peopleActions.remove}
        onContactSubmit={contactActions.create}
        onContactUpdate={contactActions.update}
        onContactDelete={contactActions.remove}
        onMembershipSubmit={handleMembershipSubmit}
        onMembershipCancel={handleMembershipCancel}
        onScheduledMembershipCancel={handleScheduledMembershipCancel}
        onMembershipRenew={handleMembershipRenew}
        onPaymentSubmit={handlePaymentSubmit}
        onPaymentReverse={handlePaymentReverse}
        onCollectionSubmit={handleCollectionSubmit}
        onDocumentUpload={documentActions.upload}
        onDocumentView={documentActions.view}
        onDocumentDownload={documentActions.download}
        onDocumentDelete={documentActions.remove}
      />

      <AssociateCommitteeModal
        isOpen={!!committeeActions.mode}
        mode={committeeActions.mode}
        loading={committeeActions.loading}
        onClose={committeeActions.close}
        onSubmit={committeeActions.submit}
      />
    </div>
  )
}
