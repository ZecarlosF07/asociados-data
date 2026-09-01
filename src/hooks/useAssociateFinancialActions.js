import { useState } from 'react'
import { membershipsService } from '../services/memberships.service'
import { paymentsService } from '../services/payments.service'

export function useAssociateFinancialActions({
  associateId,
  notify,
  refetch,
}) {
  const [financialLoading, setFinancialLoading] = useState(false)

  const handleMembershipSubmit = async (data) => {
    setFinancialLoading(true)
    try {
      await membershipsService.create({
        ...data,
        associate_id: associateId,
      })
      notify.success('Membresía creada y cronograma generado')
      refetch()
      return true
    } catch (error) {
      notify.error('Error: ' + error.message)
      return false
    } finally {
      setFinancialLoading(false)
    }
  }

  const handleMembershipCancel = async (membership) => {
    if (!confirm(`¿Cancelar la membresía ${membership.membership_type?.label}? La deuda vencida se conservará y las cuotas futuras serán anuladas.`)) return

    setFinancialLoading(true)
    try {
      await membershipsService.cancel(membership.id)
      notify.success('Membresía cancelada')
      refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setFinancialLoading(false)
    }
  }

  const handleMembershipRenew = async (oldMembershipId, newData) => {
    setFinancialLoading(true)
    try {
      await membershipsService.renew(
        oldMembershipId,
        {
          ...newData,
          associate_id: associateId,
        }
      )

      notify.success('Membresía renovada y cronograma generado')
      refetch()
      return true
    } catch (error) {
      notify.error('Error: ' + error.message)
      return false
    } finally {
      setFinancialLoading(false)
    }
  }

  const handleScheduledMembershipCancel = async (membership) => {
    if (!confirm('¿Cancelar esta renovación programada? Su cronograma será anulado.')) return

    setFinancialLoading(true)
    try {
      await membershipsService.cancelScheduled(membership.id)
      notify.success('Renovación programada cancelada')
      refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setFinancialLoading(false)
    }
  }

  const handlePaymentSubmit = async (data) => {
    setFinancialLoading(true)
    try {
      await paymentsService.create(data)
      notify.success('Pago registrado y cronograma actualizado')
      refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setFinancialLoading(false)
    }
  }

  const handlePaymentReverse = async (payment) => {
    const reason = prompt('Indica el motivo de la reversión del pago:')?.trim()
    if (!reason) return

    setFinancialLoading(true)
    try {
      await paymentsService.reverse(payment.id, { reason })
      notify.success('Pago reversado y saldo recalculado')
      refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setFinancialLoading(false)
    }
  }

  return {
    financialLoading,
    handleMembershipSubmit,
    handleMembershipCancel,
    handleScheduledMembershipCancel,
    handleMembershipRenew,
    handlePaymentSubmit,
    handlePaymentReverse,
  }
}
