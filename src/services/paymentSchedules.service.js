import { supabase } from '../lib/supabaseClient'

const SCHEDULE_SELECT = `
  *,
  collection_status:collection_status_id(id, code, label),
  payment_health:payment_health_status_id(id, code, label)
`

export const paymentSchedulesService = {
  async getByAssociate(associateId) {
    const { data, error } = await supabase
      .from('payment_schedules')
      .select(SCHEDULE_SELECT)
      .eq('associate_id', associateId)
      .eq('is_deleted', false)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data
  },

  async getByMembership(membershipId) {
    const { data, error } = await supabase
      .from('payment_schedules')
      .select(SCHEDULE_SELECT)
      .eq('membership_id', membershipId)
      .eq('is_deleted', false)
      .order('due_date', { ascending: true })

    if (error) throw error
    return data
  },

  async getForCollection({ associateId, isPaid = false } = {}) {
    let query = supabase
      .from('payment_schedules')
      .select(`
        ${SCHEDULE_SELECT},
        associate:associate_id(id, company_name, ruc, internal_code),
        membership:membership_id(
          id,
          membership_type_id,
          membership_type:membership_type_id(id, code, label)
        )
      `)
      .eq('is_deleted', false)
      .eq('is_paid', isPaid)
      .order('due_date', { ascending: true })

    if (associateId) query = query.eq('associate_id', associateId)

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getPending({ associateId } = {}) {
    return paymentSchedulesService.getForCollection({ associateId, isPaid: false })
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('payment_schedules')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(SCHEDULE_SELECT)
      .single()

    if (error) throw error
    return data
  },

  async updateCollectionStatus(id, { statusCode, userId }) {
    const { data: status, error: statusError } = await supabase
      .from('catalog_items')
      .select('id, group:group_id(code)')
      .eq('code', statusCode)
      .eq('is_deleted', false)

    if (statusError) throw statusError

    const collectionStatus = status?.find(
      (item) => item.group?.code === 'COLLECTION_STATUS'
    )

    if (!collectionStatus) {
      throw new Error(`No se encontró el estado de cobranza ${statusCode}.`)
    }

    return paymentSchedulesService.update(id, {
      collection_status_id: collectionStatus.id,
      updated_by: userId,
    })
  },

  async softDeleteByMembership(membershipId, deletedBy) {
    const { error } = await supabase
      .from('payment_schedules')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('membership_id', membershipId)
      .eq('is_paid', false)

    if (error) throw error
  },
}
