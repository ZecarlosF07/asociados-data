import { WITHOUT_COMMITTEE } from './committeeConstants.js'
import {
  COMPANY_CONTACT_SOURCES,
  COMPANY_CONTACT_TYPES,
} from './companyContactUtils.js'

const CONTACT_TYPE_PREFIX = 'CONTACT_TYPE:'
const AREA_PREFIX = 'AREA:'

export const DEFAULT_COMPANY_CONTACT_FILTERS = {
  search: '',
  contactCriteria: [],
  committeeIds: [],
  statusId: '',
  categoryId: '',
  onlyPrimary: false,
}

export function buildContactCriteriaOptions(areas) {
  const representativeOptions = [
    {
      value: contactTypeCriterion(COMPANY_CONTACT_TYPES.LEGAL_REPRESENTATIVE),
      label: 'Representante legal',
    },
    {
      value: contactTypeCriterion(COMPANY_CONTACT_TYPES.CHAMBER_REPRESENTATIVE),
      label: 'Representante ante la Cámara',
    },
  ]
  const areaOptions = areas.map((area) => ({
    value: areaCriterion(area.id),
    label: `Área · ${area.label}`,
  }))

  return [...representativeOptions, ...areaOptions]
}

export function buildCommitteeOptions(committees) {
  return [
    ...committees.map((committee) => ({
      value: committee.id,
      label: committee.code ? `${committee.code} · ${committee.name}` : committee.name,
    })),
    { value: WITHOUT_COMMITTEE, label: 'Sin comité' },
  ]
}

export function filterCompanyContacts(contacts, filters) {
  return contacts.filter((contact) => {
    if (!matchesContactCriteria(contact, filters.contactCriteria)) return false
    if (!matchesCommittee(contact, filters.committeeIds)) return false
    if (filters.onlyPrimary && !contact.is_primary) return false
    if (filters.statusId && contact.associate?.associate_status_id !== filters.statusId) return false
    if (filters.categoryId && contact.associate?.category_id !== filters.categoryId) return false
    return matchesSearch(contact, filters.search)
  })
}

export function hasCompanyContactFilters(filters) {
  return Boolean(
    filters.search ||
    filters.contactCriteria.length ||
    filters.committeeIds.length ||
    filters.statusId ||
    filters.categoryId ||
    filters.onlyPrimary
  )
}

function matchesContactCriteria(contact, criteria) {
  if (!criteria.length) return true

  const criterion = contact.source === COMPANY_CONTACT_SOURCES.AREA_CONTACT
    ? areaCriterion(contact.area_id)
    : contactTypeCriterion(contact.contact_type)

  return criteria.includes(criterion)
}

function matchesCommittee(contact, committeeIds) {
  if (!committeeIds.length) return true
  const committeeId = contact.associate?.primary_committee?.id || WITHOUT_COMMITTEE
  return committeeIds.includes(committeeId)
}

function contactTypeCriterion(contactType) {
  return `${CONTACT_TYPE_PREFIX}${contactType}`
}

function areaCriterion(areaId) {
  return `${AREA_PREFIX}${areaId}`
}

function matchesSearch(contact, search) {
  const term = search?.trim().toLowerCase()
  if (!term) return true

  return getSearchValues(contact).some((value) =>
    String(value || '').toLowerCase().includes(term)
  )
}

function getSearchValues(contact) {
  return [
    contact.full_name,
    contact.position,
    contact.email,
    contact.phone,
    contact.dni,
    contact.person_role?.label,
    contact.area?.label,
    contact.associate?.company_name,
    contact.associate?.ruc,
    contact.associate?.internal_code,
    contact.associate?.primary_committee?.name,
  ]
}
