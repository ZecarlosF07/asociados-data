import { supabase } from '../lib/supabaseClient'

const EVALUATION_SELECT = `
  *,
  suggested_category:suggested_category_id(id, code, name, base_fee)
`

export const prospectEvaluationsService = {
  async getByProspect(prospectId) {
    const { data, error } = await supabase
      .from('prospect_evaluations')
      .select(EVALUATION_SELECT)
      .eq('prospect_id', prospectId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getCurrent(prospectId) {
    const { data, error } = await supabase
      .from('prospect_evaluations')
      .select(EVALUATION_SELECT)
      .eq('prospect_id', prospectId)
      .eq('is_current', true)
      .eq('is_deleted', false)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async create(evaluation) {
    // Marcar evaluaciones anteriores como no vigentes
    await supabase
      .from('prospect_evaluations')
      .update({ is_current: false })
      .eq('prospect_id', evaluation.prospect_id)
      .eq('is_current', true)

    const { data, error } = await supabase
      .from('prospect_evaluations')
      .insert({ ...evaluation, is_current: true })
      .select(EVALUATION_SELECT)
      .single()

    if (error) throw error
    return data
  },
}
