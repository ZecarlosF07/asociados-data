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

export function AssociateDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { profile } = useUserProfile()
  const { canEdit } = usePermissions()
  const canEditAssociate = canEdit('asociados')
  const detail = useAssociateDetail(id)
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
    handleMembershipDelete,
    handleMembershipCancel,
    handleMembershipRenew,
    handlePaymentSubmit,
  } = useAssociateFinancialActions({
    associateId: id,
    profile,
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
  const isActionLoading = financialLoading || collectionLoading || committeeActions.loading
    || peopleActions.loading || contactActions.loading || documentActions.loading

  if (detail.loading || detail.error || !detail.associate) {
    return <AssociateDetailState loading={detail.loading} error={detail.error} onBack={() => navigate(ROUTES.ASOCIADOS)} />
  }

  return (
    <div className="max-w-5xl">
      <AssociateDetailHeader
        associate={detail.associate}
        canEdit={canEditAssociate}
        committeeActionLoading={committeeActions.loading}
        onEdit={() => navigate(`${ROUTES.ASOCIADOS}/${id}/editar`)}
        onBack={() => navigate(ROUTES.ASOCIADOS)}
        onManageCommittee={committeeActions.open}
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
        actionLoading={isActionLoading}
        onPersonSubmit={peopleActions.create}
        onPersonUpdate={peopleActions.update}
        onPersonDelete={peopleActions.remove}
        onContactSubmit={contactActions.create}
        onContactUpdate={contactActions.update}
        onContactDelete={contactActions.remove}
        onMembershipSubmit={handleMembershipSubmit}
        onMembershipDelete={handleMembershipDelete}
        onMembershipCancel={handleMembershipCancel}
        onMembershipRenew={handleMembershipRenew}
        onPaymentSubmit={handlePaymentSubmit}
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
