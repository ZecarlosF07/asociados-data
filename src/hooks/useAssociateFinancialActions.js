import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { membershipsService } from '../services/memberships.service'
import { paymentsService } from '../services/payments.service'

export function useAssociateFinancialActions({
  associateId,
  profile,
  notify,
  refetch,
}) {
  const [financialLoading, setFinancialLoading] = useState(false)

  const getPendingCollectionStatus = async () => {
    const { data, error } = await supabase
      .from('catalog_items')
      .select('id, group:group_id(code)')
      .eq('code', 'PENDIENTE')
      .eq('is_deleted', false)

    if (error) throw error

    return data?.find(
      (item) => item.group?.code === 'COLLECTION_STATUS'
    )
  }

  const generateScheduleForMembership = async (membership) => {
    const pendingStatus = await getPendingCollectionStatus()

    if (!pendingStatus) {
      throw new Error('No se encontró el estado PENDIENTE de cobranza.')
    }

    await membershipsService.generateSchedule({
      membership,
      defaultStatusId: pendingStatus.id,
      userId: profile?.id,
    })
  }

  const handleMembershipSubmit = async (data) => {
    setFinancialLoading(true)
    try {
      const membership = await membershipsService.create({
        ...data,
        associate_id: associateId,
      })

      await generateScheduleForMembership(membership)
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
    if (!confirm(`¿Cancelar la membresía ${membership.membership_type?.label}? Las cuotas no pagadas serán eliminadas.`)) return

    setFinancialLoading(true)
    try {
      await membershipsService.cancel(membership.id, profile?.id)
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
      const membership = await membershipsService.renew(
        oldMembershipId,
        {
          ...newData,
          associate_id: associateId,
        }
      )

      await generateScheduleForMembership(membership)
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

  return {
    financialLoading,
    handleMembershipSubmit,
    handleMembershipCancel,
    handleMembershipRenew,
    handlePaymentSubmit,
  }
}
