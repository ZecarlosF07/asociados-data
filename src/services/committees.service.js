import { supabase } from '../lib/supabaseClient'

const COMMITTEE_FIELDS = 'id, code, name, description, is_active, created_at, updated_at'

export const committeesService = {
  async getAll({ search = '', activeOnly = false } = {}) {
    let query = supabase
      .from('committees')
      .select(COMMITTEE_FIELDS)
      .eq('is_deleted', false)
      .order('name')

    if (activeOnly) query = query.eq('is_active', true)
    if (search.trim()) {
      const term = search.trim()
      query = query.or(`name.ilike.%${term}%,code.ilike.%${term}%`)
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('committees')
      .select(COMMITTEE_FIELDS)
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    return data
  },

  async getCurrentAssociates(committeeId) {
    const { data, error } = await supabase
      .from('associate_committees')
      .select(`
        id,
        joined_at,
        associate:associate_id(
          id,
          internal_code,
          company_name,
          ruc,
          associate_status:associate_status_id(id, code, label)
        )
      `)
      .eq('committee_id', committeeId)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .order('joined_at', { ascending: false })

    if (error) throw error
    return data
  },

  async create(values) {
    const { data, error } = await supabase
      .from('committees')
      .insert(cleanCommitteeValues(values))
      .select(COMMITTEE_FIELDS)
      .single()

    if (error) throw error
    return data
  },

  async update(id, values) {
    const { data, error } = await supabase
      .from('committees')
      .update(cleanCommitteeValues(values))
      .eq('id', id)
      .select(COMMITTEE_FIELDS)
      .single()

    if (error) throw error
    return data
  },

  async setActiveStatus(id, isActive) {
    const { data, error } = await supabase.rpc('set_committee_active_status', {
      p_committee_id: id,
      p_is_active: isActive,
    })

    if (error) throw error
    return data
  },
}

function cleanCommitteeValues(values) {
  return {
    code: values.code?.trim() || null,
    description: values.description?.trim() || null,
    name: values.name?.trim(),
  }
}
