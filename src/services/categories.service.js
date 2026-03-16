import { supabase } from '../lib/supabaseClient'

export const categoriesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_deleted', false)
      .eq('is_active', true)
      .order('sort_order')

    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    return data
  },

  async create(category) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async softDelete(id, deletedBy) {
    const { data, error } = await supabase
      .from('categories')
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

  async suggestByScore(averageScore) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_deleted', false)
      .eq('is_active', true)
      .lte('min_score', averageScore)
      .gte('max_score', averageScore)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },
}
