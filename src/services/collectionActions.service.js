import { supabase } from '../lib/supabaseClient'

const ACTION_SELECT = `
  *,
  payment_schedule:payment_schedule_id(id, due_date, period_year, period_month, expected_amount, is_paid),
  contact_type:contact_type_id(id, code, label),
  action_result:action_result_id(id, code, label),
  managed_by:managed_by_user_id(id, first_name, last_name)
`

export const collectionActionsService = {
  async getByAssociate(associateId) {
    const { data, error } = await supabase
      .from('collection_actions')
      .select(ACTION_SELECT)
      .eq('associate_id', associateId)
      .eq('is_deleted', false)
      .order('action_date', { ascending: false })

    if (error) throw error
    return data
  },

  async create(action) {
    const { data, error } = await supabase
      .from('collection_actions')
      .insert(action)
      .select(ACTION_SELECT)
      .single()

    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('collection_actions')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(ACTION_SELECT)
      .single()

    if (error) throw error
    return data
  },

  async softDelete(id, deletedBy) {
    const { error } = await supabase
      .from('collection_actions')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('id', id)

    if (error) throw error
  },
}
