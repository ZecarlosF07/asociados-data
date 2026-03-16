import { supabase } from '../lib/supabaseClient'

const ASSOCIATE_SELECT = `
  *,
  associate_status:associate_status_id(id, code, label),
  category:category_id(id, code, name, base_fee),
  activity_type:activity_type_id(id, code, label),
  company_size:company_size_id(id, code, label),
  affiliation_responsible:affiliation_responsible_user_id(id, first_name, last_name),
  captador:captador_id(id, full_name, is_internal),
  payment_health:payment_health_status_id(id, code, label)
`

export const associatesService = {
  async getAll({ search, statusId, categoryId } = {}) {
    let query = supabase
      .from('associates')
      .select(ASSOCIATE_SELECT)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (search) {
      query = query.or(
        `company_name.ilike.%${search}%,trade_name.ilike.%${search}%,ruc.ilike.%${search}%,internal_code.ilike.%${search}%`
      )
    }

    if (statusId) query = query.eq('associate_status_id', statusId)
    if (categoryId) query = query.eq('category_id', categoryId)

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('associates')
      .select(ASSOCIATE_SELECT)
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    return data
  },

  async create(associate) {
    const { data, error } = await supabase
      .from('associates')
      .insert(associate)
      .select(ASSOCIATE_SELECT)
      .single()

    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('associates')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(ASSOCIATE_SELECT)
      .single()

    if (error) throw error
    return data
  },

  async softDelete(id, deletedBy) {
    const { data, error } = await supabase
      .from('associates')
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

  async generateCode() {
    const year = new Date().getFullYear()
    const { count, error } = await supabase
      .from('associates')
      .select('*', { count: 'exact', head: true })

    if (error) throw error
    const seq = String((count || 0) + 1).padStart(4, '0')
    return `ASO-${year}-${seq}`
  },

  async convertFromProspect({ prospect, conversionData, userId }) {
    const code = await associatesService.generateCode()

    const associate = {
      internal_code: code,
      ruc: prospect.ruc,
      company_name: prospect.company_name,
      trade_name: prospect.trade_name,
      economic_activity: prospect.economic_activity,
      activity_type_id: prospect.activity_type_id,
      company_size_id: prospect.company_size_id,
      corporate_email: prospect.primary_email,
      category_id: prospect.current_category_id,
      captador_id: prospect.captador_id,
      prospect_origin_id: prospect.id,
      associate_status_id: conversionData.statusId,
      association_date: conversionData.associationDate,
      affiliation_responsible_user_id: conversionData.responsibleUserId || userId,
      notes: conversionData.notes || null,
      created_by: userId,
    }

    const { data: created, error: createError } = await supabase
      .from('associates')
      .insert(associate)
      .select(ASSOCIATE_SELECT)
      .single()

    if (createError) throw createError

    const { error: updateError } = await supabase
      .from('prospects')
      .update({
        converted_to_associate_id: created.id,
        converted_at: new Date().toISOString(),
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', prospect.id)

    if (updateError) throw updateError

    return created
  },

  // ---- Personas vinculadas ----

  async getPeople(associateId) {
    const { data, error } = await supabase
      .from('associate_people')
      .select(`
        *,
        person_role:person_role_id(id, code, label)
      `)
      .eq('associate_id', associateId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  async createPerson(person) {
    const { data, error } = await supabase
      .from('associate_people')
      .insert(person)
      .select(`*, person_role:person_role_id(id, code, label)`)
      .single()

    if (error) throw error
    return data
  },

  async updatePerson(id, updates) {
    const { data, error } = await supabase
      .from('associate_people')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`*, person_role:person_role_id(id, code, label)`)
      .single()

    if (error) throw error
    return data
  },

  async softDeletePerson(id, deletedBy) {
    const { error } = await supabase
      .from('associate_people')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('id', id)

    if (error) throw error
  },

  // ---- Contactos por área ----

  async getAreaContacts(associateId) {
    const { data, error } = await supabase
      .from('associate_area_contacts')
      .select(`
        *,
        area:area_id(id, code, label)
      `)
      .eq('associate_id', associateId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data
  },

  async createAreaContact(contact) {
    const { data, error } = await supabase
      .from('associate_area_contacts')
      .insert(contact)
      .select(`*, area:area_id(id, code, label)`)
      .single()

    if (error) throw error
    return data
  },

  async updateAreaContact(id, updates) {
    const { data, error } = await supabase
      .from('associate_area_contacts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(`*, area:area_id(id, code, label)`)
      .single()

    if (error) throw error
    return data
  },

  async softDeleteAreaContact(id, deletedBy) {
    const { error } = await supabase
      .from('associate_area_contacts')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('id', id)

    if (error) throw error
  },
}
