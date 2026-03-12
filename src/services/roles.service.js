import { supabase } from '../lib/supabaseClient'

export const rolesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },
}
