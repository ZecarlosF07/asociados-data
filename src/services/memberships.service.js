import { supabase } from '../lib/supabaseClient'

const MEMBERSHIP_SELECT = `
  *,
  membership_type:membership_type_id(id, code, label),
  category:category_id(id, code, name, base_fee),
  stored_membership_status:membership_status_id(id, code, label)
`

export const membershipsService = {
  async getAll({ search, statusId, typeId } = {}) {
    let query = supabase
      .from('memberships')
      .select(`
        ${MEMBERSHIP_SELECT},
        associate:associate_id(id, company_name, ruc, internal_code, trade_name)
      `)
      .eq('is_deleted', false)
      .order('start_date', { ascending: false })

    if (typeId) query = query.eq('membership_type_id', typeId)

    const { data, error } = await query
    if (error) throw error

    let result = await attachOperationalMemberships(data || [])
    if (statusId) {
      const statusCode = await getCatalogCode(statusId)
      result = result.filter((membership) => membership.membership_status?.code === statusCode)
    }
    if (search) {
      const term = search.toLowerCase()
      result = result.filter(
        (membership) =>
          membership.associate?.company_name?.toLowerCase().includes(term) ||
          membership.associate?.ruc?.includes(term) ||
          membership.associate?.internal_code?.toLowerCase().includes(term)
      )
    }
    return result
  },

  async getByAssociate(associateId) {
    const { data, error } = await supabase
      .from('memberships')
      .select(MEMBERSHIP_SELECT)
      .eq('associate_id', associateId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return attachOperationalMemberships(data || [])
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('memberships')
      .select(MEMBERSHIP_SELECT)
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    const [membership] = await attachOperationalMemberships([data])
    return membership
  },

  async create(membership) {
    const { data, error } = await supabase.rpc('create_membership_period', {
      p_associate_id: membership.associate_id,
      p_membership_type_id: membership.membership_type_id,
      p_fee_amount: Number(membership.fee_amount),
      p_start_date: membership.start_date,
      p_monthly_billing_day: membership.monthly_billing_day
        ? Number(membership.monthly_billing_day)
        : null,
      p_negotiation_notes: membership.negotiation_notes || null,
    })

    if (error) throw normalizeMembershipError(error)
    return this.getById(data.id)
  },

  async renew(oldMembershipId, membership) {
    const { data, error } = await supabase.rpc('renew_membership_period', {
      p_membership_id: oldMembershipId,
      p_membership_type_id: membership.membership_type_id,
      p_fee_amount: Number(membership.fee_amount),
      p_start_date: membership.start_date,
      p_monthly_billing_day: membership.monthly_billing_day
        ? Number(membership.monthly_billing_day)
        : null,
      p_negotiation_notes: membership.negotiation_notes || null,
    })

    if (error) throw normalizeMembershipError(error)
    return this.getById(data.id)
  },

  async cancel(id) {
    const { data, error } = await supabase.rpc('cancel_membership_period', {
      p_membership_id: id,
    })
    if (error) throw normalizeMembershipError(error)
    return data
  },

  async cancelScheduled(id) {
    const { data, error } = await supabase.rpc('cancel_scheduled_membership', {
      p_membership_id: id,
    })
    if (error) throw normalizeMembershipError(error)
    return data
  },
}

async function attachOperationalMemberships(memberships) {
  const ids = memberships.map((membership) => membership.id).filter(Boolean)
  if (!ids.length) return memberships

  const { data, error } = await supabase
    .from('membership_operational_summary')
    .select(`
      id, effective_end_date, effective_status_code, effective_status_label,
      is_effective, is_scheduled, successor_membership_id,
      renewed_from_membership_id, operational_end_date
    `)
    .in('id', ids)

  if (error) throw error
  const operationalById = new Map((data || []).map((row) => [row.id, row]))

  return memberships.map((membership) => {
    const operational = operationalById.get(membership.id)
    return {
      ...membership,
      ...operational,
      membership_status: {
        code: operational?.effective_status_code || membership.stored_membership_status?.code,
        label: operational?.effective_status_label || membership.stored_membership_status?.label,
      },
    }
  })
}

async function getCatalogCode(id) {
  const { data, error } = await supabase
    .from('catalog_items')
    .select('code')
    .eq('id', id)
    .single()
  if (error) throw error
  return data.code
}

function normalizeMembershipError(error) {
  if (error?.code === '23505') {
    return new Error(error.message || 'El asociado ya tiene una membresía vigente o programada.')
  }
  if (error?.code === '23P01') {
    return new Error('El periodo se superpone con otra membresía del asociado.')
  }
  return error
}
