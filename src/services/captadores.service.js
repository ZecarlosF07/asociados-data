import { supabase } from '../lib/supabaseClient'

const CAPTADOR_SELECT = `
  *,
  user_profile:user_profile_id(id, first_name, last_name)
`

export const captadoresService = {
  async getAll() {
    const { data, error } = await supabase
      .from('captadores')
      .select(CAPTADOR_SELECT)
      .eq('is_deleted', false)
      .eq('is_active', true)
      .order('full_name')

    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('captadores')
      .select(CAPTADOR_SELECT)
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    return data
  },

  async create(captador) {
    const { data, error } = await supabase
      .from('captadores')
      .insert(captador)
      .select(CAPTADOR_SELECT)
      .single()

    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('captadores')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(CAPTADOR_SELECT)
      .single()

    if (error) throw error
    return data
  },

  async softDelete(id, deletedBy) {
    const { data, error } = await supabase
      .from('captadores')
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
}
