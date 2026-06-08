import { useState } from 'react'
import { collectionActionsService } from '../services/collectionActions.service'
import { paymentsService } from '../services/payments.service'
import { paymentSchedulesService } from '../services/paymentSchedules.service'

export function usePendingPaymentActions({
  activeCollectionRow,
  activePaymentRow,
  fetchSchedules,
  notify,
  profile,
  schedules,
  setActiveCollectionRow,
  setActivePaymentRow,
}) {
  const [actionLoading, setActionLoading] = useState(false)

  const handlePaymentSubmit = async (data) => {
    setActionLoading(true)
    try {
      const schedule = schedules.find((item) => item.id === activePaymentRow)

      await paymentsService.create({
        ...data,
        payment_schedule_id: schedule.id,
      })

      notify.success('Pago registrado y cronograma actualizado')
      setActivePaymentRow(null)
      fetchSchedules()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleCollectionSubmit = async (data) => {
    setActionLoading(true)
    try {
      const schedule = schedules.find((item) => item.id === activeCollectionRow)

      await collectionActionsService.create({
        ...data,
        associate_id: schedule.associate_id,
        payment_schedule_id: schedule.id,
        managed_by_user_id: profile?.id,
        created_by: profile?.id,
      })

      await paymentSchedulesService.updateCollectionStatus(schedule.id, {
        statusCode: 'EN_GESTION',
        userId: profile?.id,
      })

      notify.success('Gestión de cobranza registrada')
      setActiveCollectionRow(null)
      fetchSchedules()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  return {
    actionLoading,
    handleCollectionSubmit,
    handlePaymentSubmit,
  }
}
