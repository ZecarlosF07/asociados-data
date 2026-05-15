import { supabase } from '../lib/supabaseClient'

const ASSOCIATE_SELECT = `
  *,
  associate_status:associate_status_id(id, code, label),
  category:category_id(id, code, name, base_fee),
  activity_type:activity_type_id(id, code, label),
  company_size:company_size_id(id, code, label),
  affiliation_responsible:affiliation_responsible_user_id(id, first_name, last_name),
  captador:captador_id(id, full_name, is_internal),
  payment_health:payment_health_status_id(id, code, label),
  prospect_origin:prospect_origin_id(id, suggested_fee, current_category_id, current_category:current_category_id(id, code, name, base_fee))
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

  async createDirectAssociate(associate) {
    const { data: created, error } = await supabase.rpc(
      'create_direct_associate',
      {
        p_company_name: associate.company_name,
        p_ruc: associate.ruc,
        p_associate_status_id: associate.associate_status_id,
        p_association_date: associate.association_date,
        p_trade_name: associate.trade_name || null,
        p_economic_activity: associate.economic_activity || null,
        p_activity_type_id: associate.activity_type_id || null,
        p_company_size_id: associate.company_size_id || null,
        p_address: associate.address || null,
        p_corporate_email: associate.corporate_email || null,
        p_landline_phone: associate.landline_phone || null,
        p_mobile_phone_1: associate.mobile_phone_1 || null,
        p_mobile_phone_2: associate.mobile_phone_2 || null,
        p_website: associate.website || null,
        p_anniversary_date: associate.anniversary_date || null,
        p_category_id: associate.category_id || null,
        p_affiliation_responsible_user_id:
          associate.affiliation_responsible_user_id || null,
        p_captador_id: associate.captador_id || null,
        p_book_registry: associate.book_registry || null,
        p_welcome_status: associate.welcome_status || false,
        p_notes: associate.notes || null,
      }
    )

    if (error) throw new Error(getAssociateCreationErrorMessage(error))
    if (!created?.id) {
      throw new Error('El alta directa no retornó el asociado creado.')
    }

    return associatesService.getById(created.id)
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

  async convertFromProspect({ prospect, conversionData }) {
    const { data: created, error } = await supabase.rpc(
      'convert_prospect_to_associate',
      {
        p_prospect_id: prospect.id,
        p_ruc: conversionData.ruc,
        p_associate_status_id: conversionData.statusId,
        p_association_date: conversionData.associationDate,
        p_responsible_user_id: conversionData.responsibleUserId || null,
        p_notes: conversionData.notes || null,
      }
    )

    if (error) throw new Error(getConversionErrorMessage(error))
    if (!created?.id) {
      throw new Error('La conversión no retornó el asociado creado.')
    }

    return associatesService.getById(created.id)
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

function getConversionErrorMessage(error) {
  const message = error?.message || 'No se pudo convertir el prospecto.'

  if (error?.code === '42501') {
    return 'No tienes permisos para convertir prospectos en asociados.'
  }

  if (error?.code === '23505') {
    if (message.includes('RUC')) {
      return 'Ya existe un asociado activo con este RUC.'
    }

    return 'Este prospecto ya fue convertido o ya tiene un asociado activo.'
  }

  return message
}

function getAssociateCreationErrorMessage(error) {
  const message = error?.message || 'No se pudo crear el asociado.'

  if (error?.code === '42501') {
    return 'No tienes permisos para crear asociados.'
  }

  if (error?.code === '23505') {
    if (message.includes('RUC')) {
      return 'Ya existe un asociado activo con este RUC.'
    }

    if (message.includes('código') || message.includes('codigo')) {
      return 'Ya existe un asociado activo con el código interno calculado.'
    }

    return 'Ya existe un asociado activo con estos datos.'
  }

  return message
}
