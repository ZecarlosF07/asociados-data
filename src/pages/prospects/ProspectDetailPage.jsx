import { useNavigate, useParams } from 'react-router-dom'
import { useProspectDetail } from '../../hooks/useProspectDetail'
import { usePermissions } from '../../hooks/usePermissions'
import { useCategories } from '../../hooks/useCategories'
import { useProspectDetailActions } from '../../hooks/useProspectDetailActions'
import { ProspectDetailHeader } from './sections/ProspectDetailHeader'
import { ProspectDetailTabs } from './sections/ProspectDetailTabs'
import { StatusChangeModal } from '../../components/molecules/prospects/StatusChangeModal'
import { ConvertProspectModal } from '../../components/molecules/associates/ConvertProspectModal'
import { Loader } from '../../components/atoms/Loader'
import { ROUTES } from '../../router/routes'

export function ProspectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canDelete, canEdit } = usePermissions()
  const canEditProspect = canEdit('prospectos')
  const canDeleteProspect = canDelete('prospectos')
  const { categories } = useCategories()
  const detail = useProspectDetail(id)
  const actions = useProspectDetailActions({
    prospectId: id,
    prospect: detail.prospect,
    refetch: detail.refetch,
  })

  if (detail.loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader />
      </div>
    )
  }

  if (detail.error || !detail.prospect) {
    return (
      <div className="max-w-3xl text-center py-24">
        <p className="text-slate-400 mb-4">
          {detail.error || 'Prospecto no encontrado'}
        </p>
        <button
          className="text-blue-500 text-sm underline"
          onClick={() => navigate(ROUTES.PROSPECTOS)}
        >
          Volver al listado
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <ProspectDetailHeader
        prospect={detail.prospect}
        canEdit={canEditProspect}
        canDelete={canDeleteProspect}
        actionLoading={actions.actionLoading}
        onEdit={() => navigate(`${ROUTES.PROSPECTOS}/${id}/editar`)}
        onStatusChange={() => actions.setStatusModal(true)}
        onConvert={actions.openConvertModal}
        onDelete={actions.handleDelete}
        onBack={() => navigate(ROUTES.PROSPECTOS)}
      />

      <ProspectDetailTabs
        prospect={detail.prospect}
        evaluations={detail.evaluations}
        quotes={detail.quotes}
        statusHistory={detail.statusHistory}
        categories={categories}
        canEdit={canEditProspect}
        actionLoading={actions.actionLoading}
        onEvaluationSubmit={actions.handleEvaluationSubmit}
        onQuoteSubmit={actions.handleQuoteSubmit}
      />

      <StatusChangeModal
        isOpen={actions.statusModal}
        onClose={() => actions.setStatusModal(false)}
        currentStatusId={detail.prospect.prospect_status_id}
        onSubmit={actions.handleStatusChange}
        loading={actions.actionLoading}
      />

      <ConvertProspectModal
        isOpen={actions.convertModal}
        prospect={detail.prospect}
        onClose={actions.closeConvertModal}
        onSubmit={actions.handleConvert}
        loading={actions.actionLoading}
        submitError={actions.convertError}
      />
    </div>
  )
}
