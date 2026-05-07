import { supabase } from '../lib/supabaseClient'

export const userProfilesService = {
  async getMyProfile(authUserId) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*, roles(*)')
      .eq('auth_user_id', authUserId)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*, roles(code, name)')
      .eq('is_deleted', false)
      .order('last_name')

    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*, roles(*)')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    return data
  },

  async create(profile) {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert(profile)
      .select('*, roles(code, name)')
      .single()

    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', id)
      .select('*, roles(code, name)')
      .single()

    if (error) throw error
    return data
  },

  async softDelete(id, deletedBy) {
    const { data, error } = await supabase
      .from('user_profiles')
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

  async updateLastLogin() {
    const { error } = await supabase
      .rpc('touch_current_user_last_login')

    if (error) throw error
  },
}
