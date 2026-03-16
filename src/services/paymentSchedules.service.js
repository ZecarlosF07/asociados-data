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

  async getPending({ associateId } = {}) {
    let query = supabase
      .from('payment_schedules')
      .select(`
        ${SCHEDULE_SELECT},
        associate:associate_id(id, company_name, ruc, internal_code)
      `)
      .eq('is_deleted', false)
      .eq('is_paid', false)
      .order('due_date', { ascending: true })

    if (associateId) query = query.eq('associate_id', associateId)

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async markAsPaid(id, { paidAt, userId }) {
    const { data, error } = await supabase
      .from('payment_schedules')
      .update({
        is_paid: true,
        paid_at: paidAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)
      .select(SCHEDULE_SELECT)
      .single()

    if (error) throw error
    return data
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
