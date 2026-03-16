import { supabase } from '../lib/supabaseClient'

const QUOTE_SELECT = `
  *,
  category:category_id(id, code, name, base_fee),
  quote_status:quote_status_id(id, code, label),
  created_by_user:created_by(id, first_name, last_name)
`

export const prospectQuotesService = {
  async getByProspect(prospectId) {
    const { data, error } = await supabase
      .from('prospect_quotes')
      .select(QUOTE_SELECT)
      .eq('prospect_id', prospectId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async create(quote) {
    const quoteNumber = await generateQuoteNumber()

    const { data, error } = await supabase
      .from('prospect_quotes')
      .insert({ ...quote, quote_number: quoteNumber })
      .select(QUOTE_SELECT)
      .single()

    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('prospect_quotes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(QUOTE_SELECT)
      .single()

    if (error) throw error
    return data
  },
}

async function generateQuoteNumber() {
  const year = new Date().getFullYear()
  const { data } = await supabase.rpc('nextval', {
    seq_name: 'prospect_quote_seq',
  })

  const seq = data || Date.now()
  return `COT-${year}-${String(seq).padStart(5, '0')}`
}
