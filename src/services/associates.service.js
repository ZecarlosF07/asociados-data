import { supabase } from '../lib/supabaseClient'
import {
  addDaysToDateOnly,
  compareDateOnly,
  todayDateOnly,
} from '../utils/dateOnly'

const ASSOCIATE_SELECT = `
  *,
  associate_status:associate_status_id(id, code, label),
  category:category_id(id, code, name, base_fee),
  activity_type:activity_type_id(id, code, label),
  company_size:company_size_id(id, code, label),
  affiliation_responsible:affiliation_responsible_user_id(id, first_name, last_name),
  captador:captador_id(id, full_name, is_internal),
  payment_health:payment_health_status_id(id, code, label),
  prospect_origin:prospect_origin_id(id, suggested_fee, current_category_id, current_category:current_category_id(id, code, name, base_fee)),
  committee_assignments:associate_committees(
    id,
    joined_at,
    is_primary,
    is_active,
    is_deleted,
    committee:committee_id(id, code, name, description, is_active)
  )
`

export const associatesService = {
  async getAll({
    search,
    statusId,
    categoryId,
    committeeId,
    withoutCommittee = false,
  } = {}) {
    const filteredIds = await getCommitteeFilteredIds({
      committeeId,
      withoutCommittee,
    })
    if (filteredIds && filteredIds.length === 0) return []

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
    if (filteredIds) query = query.in('id', filteredIds)

    const { data, error } = await query
    if (error) throw error
    return attachComputedPaymentHealth(data.map(mapPrimaryCommittee))
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('associates')
      .select(ASSOCIATE_SELECT)
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    return mapPrimaryCommittee(data)
  },

  async create(associate) {
    const { data, error } = await supabase
      .from('associates')
      .insert(associate)
      .select(ASSOCIATE_SELECT)
      .single()

    if (error) throw error
    return mapPrimaryCommittee(data)
  },

  async createDirectAssociate(associate) {
    const { data: created, error } = await supabase.rpc(
      'create_direct_associate_with_committee',
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
        p_committee_id: associate.committee_id || null,
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
    return mapPrimaryCommittee(data)
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
      'convert_prospect_to_associate_with_committee',
      {
        p_prospect_id: prospect.id,
        p_ruc: conversionData.ruc,
        p_associate_status_id: conversionData.statusId,
        p_association_date: conversionData.associationDate,
        p_responsible_user_id: conversionData.responsibleUserId || null,
        p_notes: conversionData.notes || null,
        p_committee_id: conversionData.committeeId || null,
      }
    )

    if (error) throw new Error(getConversionErrorMessage(error))
    if (!created?.id) {
      throw new Error('La conversión no retornó el asociado creado.')
    }

    return associatesService.getById(created.id)
  },

  async setPrimaryCommittee(associateId, values) {
    const { data, error } = await supabase.rpc(
      'set_associate_primary_committee',
      {
        p_associate_id: associateId,
        p_committee_id: values.committeeId,
        p_effective_date: values.effectiveDate,
        p_notes: values.notes || null,
      }
    )

    if (error) throw error
    return data
  },

  async clearPrimaryCommittee(associateId, values) {
    const { data, error } = await supabase.rpc(
      'clear_associate_primary_committee',
      {
        p_associate_id: associateId,
        p_effective_date: values.effectiveDate,
        p_notes: values.notes || null,
      }
    )

    if (error) throw error
    return data
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

async function getCommitteeFilteredIds({ committeeId, withoutCommittee }) {
  if (!committeeId && !withoutCommittee) return null

  const { data, error } = await supabase.rpc(
    'filter_associate_ids_by_committee',
    {
      p_committee_id: committeeId || null,
      p_without_committee: withoutCommittee,
    }
  )

  if (error) throw error
  return (data || []).map((row) => row.associate_id)
}

function mapPrimaryCommittee(associate) {
  const assignment = associate.committee_assignments?.find(
    (item) => item.is_primary && item.is_active && !item.is_deleted
  )

  return {
    ...associate,
    primary_committee: assignment?.committee || null,
    primary_committee_assignment: assignment || null,
  }
}

async function attachComputedPaymentHealth(associates) {
  const associateIds = associates.map((associate) => associate.id).filter(Boolean)
  if (associateIds.length === 0) return associates

  const { data, error } = await supabase
    .from('payment_schedules')
    .select(`
      associate_id,
      due_date
    `)
    .in('associate_id', associateIds)
    .eq('is_deleted', false)
    .eq('is_paid', false)

  if (error) throw error

  const today = todayDateOnly()
  const soonLimit = addDaysToDateOnly(today, 7)
  const schedulesByAssociate = new Map()

  for (const schedule of data || []) {
    const schedules = schedulesByAssociate.get(schedule.associate_id) || []
    schedules.push(schedule)
    schedulesByAssociate.set(schedule.associate_id, schedules)
  }

  return associates.map((associate) => {
    if (associate.payment_health) return associate

    const schedules = schedulesByAssociate.get(associate.id) || []
    const overdueCount = schedules.filter(
      (schedule) => compareDateOnly(schedule.due_date, today) < 0
    ).length
    const nextDue = schedules
      .map((schedule) => schedule.due_date)
      .filter((dueDate) => compareDateOnly(dueDate, today) >= 0)
      .sort(compareDateOnly)[0]

    let healthCode = 'AL_DIA'
    if (overdueCount >= 3) {
      healthCode = 'CRITICO'
    } else if (overdueCount > 0) {
      healthCode = 'MOROSO'
    } else if (nextDue && compareDateOnly(nextDue, soonLimit) <= 0) {
      healthCode = 'POR_VENCER'
    }

    return {
      ...associate,
      payment_health: PAYMENT_HEALTH_BY_CODE[healthCode],
    }
  })
}

const PAYMENT_HEALTH_BY_CODE = {
  AL_DIA: { code: 'AL_DIA', label: 'Al día' },
  POR_VENCER: { code: 'POR_VENCER', label: 'Por vencer' },
  MOROSO: { code: 'MOROSO', label: 'Moroso' },
  CRITICO: { code: 'CRITICO', label: 'Crítico' },
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
