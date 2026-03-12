import { supabase } from '../lib/supabaseClient'

export const settingsService = {
  async getPublicSettings() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value')
      .eq('is_public', true)
      .eq('is_deleted', false)

    if (error) throw error
    return data
  },

  async getAll() {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('is_deleted', false)
      .order('setting_key')

    if (error) throw error
    return data
  },

  async getByKey(key) {
    const { data, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('setting_key', key)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('system_settings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
