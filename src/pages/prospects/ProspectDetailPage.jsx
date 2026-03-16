import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProspectDetail } from '../../hooks/useProspectDetail'
import { useNotification } from '../../hooks/useNotification'
import { useUserProfile } from '../../hooks/useUserProfile'
import { usePermissions } from '../../hooks/usePermissions'
import { useCategories } from '../../hooks/useCategories'
import { prospectsService } from '../../services/prospects.service'
import { prospectEvaluationsService } from '../../services/prospectEvaluations.service'
import { prospectQuotesService } from '../../services/prospectQuotes.service'
import { associatesService } from '../../services/associates.service'
import { ProspectDetailHeader } from './sections/ProspectDetailHeader'
import { ProspectDetailTabs } from './sections/ProspectDetailTabs'
import { StatusChangeModal } from '../../components/molecules/prospects/StatusChangeModal'
import { ConvertProspectModal } from '../../components/molecules/associates/ConvertProspectModal'
import { Loader } from '../../components/atoms/Loader'
import { ROUTES } from '../../router/routes'

export function ProspectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { profile } = useUserProfile()
  const { canEdit } = usePermissions()
  const { categories } = useCategories()
  const detail = useProspectDetail(id)
  const [statusModal, setStatusModal] = useState(false)
  const [convertModal, setConvertModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const handleStatusChange = async ({ newStatusId, reason }) => {
    setActionLoading(true)
    try {
      await prospectsService.updateStatus(id, {
        newStatusId,
        previousStatusId: detail.prospect?.prospect_status_id,
        reason,
        changedBy: profile?.id,
      })
      notify.success('Estado actualizado')
      setStatusModal(false)
      detail.refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleEvaluationSubmit = async (evaluationData) => {
    setActionLoading(true)
    try {
      await prospectEvaluationsService.create({
        ...evaluationData,
        prospect_id: id,
        created_by: profile?.id,
      })

      // Actualizar categoría y tarifa sugerida en el prospecto
      if (evaluationData.suggested_category_id) {
        await prospectsService.update(id, {
          current_category_id: evaluationData.suggested_category_id,
          suggested_fee: evaluationData.suggested_fee,
          updated_by: profile?.id,
        })
      }

      notify.success('Evaluación registrada')
      detail.refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleQuoteSubmit = async (quoteData) => {
    setActionLoading(true)
    try {
      await prospectQuotesService.create({
        ...quoteData,
        prospect_id: id,
        created_by: profile?.id,
      })
      notify.success('Cotización registrada')
      detail.refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleConvert = async (conversionData) => {
    setActionLoading(true)
    try {
      const associate = await associatesService.convertFromProspect({
        prospect: detail.prospect,
        conversionData,
        userId: profile?.id,
      })
      notify.success('Prospecto convertido a asociado')
      setConvertModal(false)
      navigate(`${ROUTES.ASOCIADOS}/${associate.id}`)
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

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
        canEdit={canEdit}
        onEdit={() => navigate(`${ROUTES.PROSPECTOS}/${id}/editar`)}
        onStatusChange={() => setStatusModal(true)}
        onConvert={() => setConvertModal(true)}
        onBack={() => navigate(ROUTES.PROSPECTOS)}
      />

      <ProspectDetailTabs
        prospect={detail.prospect}
        evaluations={detail.evaluations}
        quotes={detail.quotes}
        statusHistory={detail.statusHistory}
        categories={categories}
        canEdit={canEdit}
        actionLoading={actionLoading}
        onEvaluationSubmit={handleEvaluationSubmit}
        onQuoteSubmit={handleQuoteSubmit}
      />

      <StatusChangeModal
        isOpen={statusModal}
        onClose={() => setStatusModal(false)}
        currentStatusId={detail.prospect.prospect_status_id}
        onSubmit={handleStatusChange}
        loading={actionLoading}
      />

      <ConvertProspectModal
        isOpen={convertModal}
        prospect={detail.prospect}
        onClose={() => setConvertModal(false)}
        onSubmit={handleConvert}
        loading={actionLoading}
      />
    </div>
  )
}
