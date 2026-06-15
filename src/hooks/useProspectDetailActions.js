import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { associatesService } from '../services/associates.service'
import { prospectEvaluationsService } from '../services/prospectEvaluations.service'
import { prospectQuotesService } from '../services/prospectQuotes.service'
import { prospectsService } from '../services/prospects.service'
import { ROUTES } from '../router/routes'
import { useNotification } from './useNotification'
import { useUserProfile } from './useUserProfile'

export function useProspectDetailActions({ prospectId, prospect, refetch }) {
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { profile } = useUserProfile()
  const [statusModal, setStatusModal] = useState(false)
  const [convertModal, setConvertModal] = useState(false)
  const [convertError, setConvertError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const handleStatusChange = async ({ newStatusId, reason }) => {
    await runAction(async () => {
      await prospectsService.updateStatus(prospectId, {
        newStatusId,
        previousStatusId: prospect?.prospect_status_id,
        reason,
        changedBy: profile?.id,
      })
      notify.success('Estado actualizado')
      setStatusModal(false)
      refetch()
    })
  }

  const handleEvaluationSubmit = async (evaluationData) => {
    await runAction(async () => {
      await prospectEvaluationsService.create({
        ...evaluationData,
        prospect_id: prospectId,
        created_by: profile?.id,
      })

      if (evaluationData.suggested_category_id) {
        await prospectsService.update(prospectId, {
          current_category_id: evaluationData.suggested_category_id,
          suggested_fee: evaluationData.suggested_fee,
          updated_by: profile?.id,
        })
      }

      notify.success('Evaluación registrada')
      refetch()
    })
  }

  const handleQuoteSubmit = async (quoteData) => {
    await runAction(async () => {
      await prospectQuotesService.create({
        ...quoteData,
        prospect_id: prospectId,
        created_by: profile?.id,
      })
      notify.success('Cotización registrada')
      refetch()
    })
  }

  const handleConvert = async (conversionData) => {
    setConvertError(null)
    await runAction(async () => {
      const associate = await associatesService.convertFromProspect({
        prospect,
        conversionData,
      })
      notify.success('Prospecto convertido a asociado')
      setConvertModal(false)
      navigate(`${ROUTES.ASOCIADOS}/${associate.id}`)
    }, setConvertError)
  }

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar el prospecto "${prospect.company_name}"?`)) return

    await runAction(async () => {
      await prospectsService.softDelete(prospectId, profile?.id)
      notify.success('Prospecto eliminado')
      navigate(ROUTES.PROSPECTOS)
    })
  }

  const openConvertModal = () => {
    setConvertError(null)
    setConvertModal(true)
  }

  const closeConvertModal = () => {
    setConvertError(null)
    setConvertModal(false)
  }

  const runAction = async (callback, onError) => {
    setActionLoading(true)
    try {
      await callback()
    } catch (error) {
      onError?.(error.message)
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  return {
    actionLoading,
    closeConvertModal,
    convertError,
    convertModal,
    handleConvert,
    handleDelete,
    handleEvaluationSubmit,
    handleQuoteSubmit,
    handleStatusChange,
    openConvertModal,
    setStatusModal,
    statusModal,
  }
}
