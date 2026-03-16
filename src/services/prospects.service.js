import { supabase } from '../lib/supabaseClient'

const PROSPECT_SELECT = `
  *,
  prospect_status:prospect_status_id(id, code, label),
  current_category:current_category_id(id, code, name, base_fee),
  activity_type:activity_type_id(id, code, label),
  company_size:company_size_id(id, code, label),
  captured_by:captured_by_user_id(id, first_name, last_name)
`

export const prospectsService = {
  async getAll({ search, statusId, categoryId } = {}) {
    let query = supabase
      .from('prospects')
      .select(PROSPECT_SELECT)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(
        `company_name.ilike.%${search}%,trade_name.ilike.%${search}%,ruc.ilike.%${search}%,contact_name.ilike.%${search}%`
      )
    }

    if (statusId) query = query.eq('prospect_status_id', statusId)
    if (categoryId) query = query.eq('current_category_id', categoryId)

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('prospects')
      .select(PROSPECT_SELECT)
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    return data
  },

  async create(prospect) {
    const { data, error } = await supabase
      .from('prospects')
      .insert(prospect)
      .select(PROSPECT_SELECT)
      .single()

    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('prospects')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(PROSPECT_SELECT)
      .single()

    if (error) throw error
    return data
  },

  async softDelete(id, deletedBy) {
    const { data, error } = await supabase
      .from('prospects')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateStatus(id, { newStatusId, previousStatusId, reason, changedBy }) {
    const { error: historyError } = await supabase
      .from('prospect_status_history')
      .insert({
        prospect_id: id,
        previous_status_id: previousStatusId,
        new_status_id: newStatusId,
        change_reason: reason,
        changed_by: changedBy,
      })

    if (historyError) throw historyError

    const { data, error } = await supabase
      .from('prospects')
      .update({
        prospect_status_id: newStatusId,
        updated_at: new Date().toISOString(),
        updated_by: changedBy,
      })
      .eq('id', id)
      .select(PROSPECT_SELECT)
      .single()

    if (error) throw error
    return data
  },

  async getStatusHistory(prospectId) {
    const { data, error } = await supabase
      .from('prospect_status_history')
      .select(`
        *,
        previous_status:previous_status_id(id, code, label),
        new_status:new_status_id(id, code, label),
        changed_by_user:changed_by(id, first_name, last_name)
      `)
      .eq('prospect_id', prospectId)
      .eq('is_deleted', false)
      .order('changed_at', { ascending: false })

    if (error) throw error
    return data
  },
}
