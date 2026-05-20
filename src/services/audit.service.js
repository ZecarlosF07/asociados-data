import { supabase } from '../lib/supabaseClient'

const AUDIT_SELECT = `
  *,
  actor:actor_user_id(id, first_name, last_name, institutional_email, is_active, roles(code, name))
`

export const auditService = {
  async getByEntity(entityName, entityId) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(AUDIT_SELECT)
      .eq('entity_name', entityName)
      .eq('entity_id', entityId)
      .order('event_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getRecent(limit = 50) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(AUDIT_SELECT)
      .order('event_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  async getAll({
    actorUserId,
    entityName,
    actionType,
    dateFrom,
    dateTo,
    limit = 50,
    offset = 0,
  } = {}) {
    let query = supabase
      .from('audit_logs')
      .select(AUDIT_SELECT, { count: 'exact' })
      .order('event_at', { ascending: false })

    if (actorUserId) query = query.eq('actor_user_id', actorUserId)
    if (entityName) query = query.eq('entity_name', entityName)
    if (actionType) query = query.eq('action_type', actionType)
    if (dateFrom) query = query.gte('event_at', toStartOfDayIso(dateFrom))
    if (dateTo) query = query.lte('event_at', toEndOfDayIso(dateTo))

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) throw error

    const enriched = await enrichAuditLogs(data || [])

    return {
      data: enriched,
      count: count || 0,
    }
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(AUDIT_SELECT)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },
}

function toStartOfDayIso(value) {
  return new Date(`${value}T00:00:00`).toISOString()
}

function toEndOfDayIso(value) {
  return new Date(`${value}T23:59:59.999`).toISOString()
}

async function enrichAuditLogs(logs) {
  const associateIds = collectIds(logs, 'associate_id')
  const prospectIds = collectIds(logs, 'prospect_id')

  const [associates, prospects] = await Promise.all([
    fetchAssociatesById(associateIds),
    fetchProspectsById(prospectIds),
  ])

  return logs.map((log) => ({
    ...log,
    related_associate: associates.get(getRelatedId(log, 'associate_id')),
    related_prospect: prospects.get(getRelatedId(log, 'prospect_id')),
  }))
}

function collectIds(logs, key) {
  return [...new Set(logs.map((log) => getRelatedId(log, key)).filter(Boolean))]
}

function getRelatedId(log, key) {
  return log?.new_data?.[key] || log?.previous_data?.[key] || log?.extra_meta?.[key]
}

async function fetchAssociatesById(ids) {
  if (ids.length === 0) return new Map()

  const { data, error } = await supabase
    .from('associates')
    .select('id, company_name, internal_code, ruc')
    .in('id', ids)

  if (error) return new Map()
  return new Map((data || []).map((item) => [item.id, item]))
}

async function fetchProspectsById(ids) {
  if (ids.length === 0) return new Map()

  const { data, error } = await supabase
    .from('prospects')
    .select('id, company_name, ruc')
    .in('id', ids)

  if (error) return new Map()
  return new Map((data || []).map((item) => [item.id, item]))
}
