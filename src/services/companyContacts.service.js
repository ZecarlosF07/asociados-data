import { supabase } from '../lib/supabaseClient'
import {
  COMPANY_CONTACT_SOURCES,
  COMPANY_CONTACT_TYPES,
  REPRESENTATIVE_CONTACT_TYPES,
  getCompanyContactTypeLabel,
} from '../utils/companyContactUtils'

const ASSOCIATE_SELECT = `
  id,
  internal_code,
  company_name,
  ruc,
  is_deleted,
  associate_status_id,
  category_id,
  associate_status:associate_status_id(id, code, label),
  category:category_id(id, code, name, base_fee),
  committee_assignments:associate_committees(
    id, joined_at, is_primary, is_active, is_deleted,
    committee:committee_id(id, code, name, description, is_active)
  )
`

const AREA_CONTACT_SELECT = `
  id, associate_id, area_id, full_name, position, email, phone,
  is_primary, notes, created_at, updated_at,
  area:area_id(id, code, label),
  associate:associate_id!inner(${ASSOCIATE_SELECT})
`

const REPRESENTATIVE_SELECT = `
  id, associate_id, person_role_id, full_name, position, email, dni, phone,
  birthday, is_primary, notes, created_at, updated_at,
  person_role:person_role_id!inner(id, code, label),
  associate:associate_id!inner(${ASSOCIATE_SELECT})
`

export const companyContactsService = {
  async getAll() {
    const [areaResult, representativeResult] = await Promise.all([
      getAreaContacts(),
      getRepresentatives(),
    ])

    if (areaResult.error) throw areaResult.error
    if (representativeResult.error) throw representativeResult.error

    return [
      ...(areaResult.data || []).map(mapAreaContact),
      ...(representativeResult.data || []).map(mapRepresentative),
    ].sort(compareByName)
  },
}

function getAreaContacts() {
  return supabase
    .from('associate_area_contacts')
    .select(AREA_CONTACT_SELECT)
    .eq('is_deleted', false)
    .eq('associate.is_deleted', false)
}

function getRepresentatives() {
  return supabase
    .from('associate_people')
    .select(REPRESENTATIVE_SELECT)
    .eq('is_deleted', false)
    .eq('associate.is_deleted', false)
    .in('person_role.code', REPRESENTATIVE_CONTACT_TYPES)
}

function mapAreaContact(contact) {
  return {
    ...contact,
    source: COMPANY_CONTACT_SOURCES.AREA_CONTACT,
    contact_type: COMPANY_CONTACT_TYPES.AREA_CONTACT,
    contact_type_label: getCompanyContactTypeLabel(COMPANY_CONTACT_TYPES.AREA_CONTACT),
    person_role: null,
    dni: null,
    birthday: null,
    associate: mapAssociate(contact.associate),
  }
}

function mapRepresentative(person) {
  return {
    ...person,
    source: COMPANY_CONTACT_SOURCES.ASSOCIATE_PERSON,
    contact_type: person.person_role?.code || '',
    contact_type_label: getCompanyContactTypeLabel(person.person_role?.code),
    area_id: null,
    area: null,
    associate: mapAssociate(person.associate),
  }
}

function mapAssociate(associate) {
  const assignment = associate?.committee_assignments?.find(
    (item) => item.is_primary && item.is_active && !item.is_deleted
  )

  return {
    ...associate,
    primary_committee: assignment?.committee || null,
    primary_committee_assignment: assignment || null,
  }
}

function compareByName(first, second) {
  return first.full_name.localeCompare(second.full_name, 'es', { sensitivity: 'base' })
}
