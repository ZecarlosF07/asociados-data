import { supabase } from '../lib/supabaseClient'

export const catalogsService = {
  async getGroupByCode(groupCode) {
    const { data, error } = await supabase
      .from('catalog_groups')
      .select('*')
      .eq('code', groupCode)
      .eq('is_active', true)
      .single()

    if (error) throw error
    return data
  },

  async getItemsByGroup(groupCode) {
    const { data, error } = await supabase
      .from('catalog_items')
      .select('*, catalog_groups!inner(code)')
      .eq('catalog_groups.code', groupCode)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .order('sort_order')

    if (error) throw error
    return data
  },

  async getAllGroups() {
    const { data, error } = await supabase
      .from('catalog_groups')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) throw error
    return data
  },

  async getItemById(id) {
    const { data, error } = await supabase
      .from('catalog_items')
      .select('*, catalog_groups(code, name)')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    return data
  },

  async createItem(item) {
    const { data, error } = await supabase
      .from('catalog_items')
      .insert(item)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateItem(id, updates) {
    const { data, error } = await supabase
      .from('catalog_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
