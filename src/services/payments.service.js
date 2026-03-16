import { supabase } from '../lib/supabaseClient'

const PAYMENT_SELECT = `
  *,
  payment_method:payment_method_id(id, code, label),
  registered_by:registered_by_user_id(id, first_name, last_name)
`

export const paymentsService = {
  async getByAssociate(associateId) {
    const { data, error } = await supabase
      .from('payments')
      .select(PAYMENT_SELECT)
      .eq('associate_id', associateId)
      .eq('is_deleted', false)
      .order('payment_date', { ascending: false })

    if (error) throw error
    return data
  },

  async create(payment) {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select(PAYMENT_SELECT)
      .single()

    if (error) throw error
    return data
  },

  async reverse(id, { reason, userId }) {
    const { data, error } = await supabase
      .from('payments')
      .update({
        is_reversed: true,
        reversed_at: new Date().toISOString(),
        reversal_reason: reason,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', id)
      .select(PAYMENT_SELECT)
      .single()

    if (error) throw error
    return data
  },

  async softDelete(id, deletedBy) {
    const { error } = await supabase
      .from('payments')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('id', id)

    if (error) throw error
  },
}
