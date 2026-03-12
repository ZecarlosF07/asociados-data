import { supabase } from '../lib/supabaseClient'

export const auditService = {
  async log({
    actorUserId,
    entityName,
    entityId,
    actionType,
    previousData = null,
    newData = null,
    summary = null,
    extraMeta = null,
  }) {
    const { error } = await supabase.from('audit_logs').insert({
      actor_user_id: actorUserId,
      entity_name: entityName,
      entity_id: entityId,
      action_type: actionType,
      previous_data: previousData,
      new_data: newData,
      summary,
      extra_meta: extraMeta,
    })

    if (error) {
      console.error('Error registrando auditoría:', error)
    }
  },

  async getByEntity(entityName, entityId) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, user_profiles:actor_user_id(first_name, last_name)')
      .eq('entity_name', entityName)
      .eq('entity_id', entityId)
      .order('event_at', { ascending: false })

    if (error) throw error
    return data
  },

  async getRecent(limit = 50) {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*, user_profiles:actor_user_id(first_name, last_name)')
      .order('event_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },
}
