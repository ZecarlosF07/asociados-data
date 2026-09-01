import { supabase } from '../lib/supabaseClient'

const SCHEDULE_SELECT = `
  *,
  collection_status:collection_status_id(id, code, label),
  payment_health:payment_health_status_id(id, code, label),
  associate:associate_id(id, company_name, ruc, internal_code),
  membership:membership_id(
    id,
    membership_type_id,
    membership_type:membership_type_id(id, code, label)
  )
`

export const paymentSchedulesService = {
  async getByAssociate(associateId) {
    const rows = await getBaseSchedules((query) => query.eq('associate_id', associateId))
    return attachBalances(rows)
  },

  async getByMembership(membershipId) {
    const rows = await getBaseSchedules((query) => query.eq('membership_id', membershipId))
    return attachBalances(rows)
  },

  async getForCollection({ associateId, isPaid = false } = {}) {
    const rows = await getBaseSchedules((query) => (
      associateId ? query.eq('associate_id', associateId) : query
    ))
    const schedules = await attachBalances(rows)

    return schedules.filter((schedule) => (
      isPaid
        ? schedule.financial_status_code === 'PAGADO'
        : schedule.is_collectible
    ))
  },

  async getPending({ associateId } = {}) {
    return this.getForCollection({ associateId, isPaid: false })
  },
}

async function getBaseSchedules(applyFilters) {
  let query = supabase
    .from('payment_schedules')
    .select(SCHEDULE_SELECT)
    .eq('is_deleted', false)
    .order('due_date', { ascending: true })

  query = applyFilters(query)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

async function attachBalances(schedules) {
  const ids = schedules.map((schedule) => schedule.id).filter(Boolean)
  if (!ids.length) return schedules

  const { data, error } = await supabase
    .from('payment_schedule_balances')
    .select(`
      id, paid_amount, outstanding_amount, financial_status_code,
      financial_status_label, is_collectible, has_collection_management,
      membership_effective_status_code, membership_start_date, last_payment_date
    `)
    .in('id', ids)

  if (error) throw error
  const balancesById = new Map((data || []).map((row) => [row.id, row]))

  return schedules.map((schedule) => {
    const balance = balancesById.get(schedule.id) || {}
    return {
      ...schedule,
      ...balance,
      schedule_status: {
        code: balance.financial_status_code || schedule.collection_status?.code,
        label: balance.financial_status_label || schedule.collection_status?.label,
      },
    }
  })
}
