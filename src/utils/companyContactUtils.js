import { formatDateOnly } from './dateOnly'

export const COMPANY_CONTACT_SOURCES = {
  AREA_CONTACT: 'AREA_CONTACT',
  ASSOCIATE_PERSON: 'ASSOCIATE_PERSON',
}

export const COMPANY_CONTACT_TYPES = {
  AREA_CONTACT: 'AREA_CONTACT',
  LEGAL_REPRESENTATIVE: 'REPRESENTANTE_LEGAL',
  CHAMBER_REPRESENTATIVE: 'REPRESENTANTE_ANTE_CAMARA',
}

export const COMPANY_CONTACT_TYPE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: COMPANY_CONTACT_TYPES.AREA_CONTACT, label: 'Contacto por área' },
  { value: COMPANY_CONTACT_TYPES.LEGAL_REPRESENTATIVE, label: 'Representante legal' },
  {
    value: COMPANY_CONTACT_TYPES.CHAMBER_REPRESENTATIVE,
    label: 'Representante ante la Cámara',
  },
]

export const REPRESENTATIVE_CONTACT_TYPES = [
  COMPANY_CONTACT_TYPES.LEGAL_REPRESENTATIVE,
  COMPANY_CONTACT_TYPES.CHAMBER_REPRESENTATIVE,
]

export const DEFAULT_COMPANY_CONTACT_FILTERS = {
  search: '',
  contactType: '',
  areaId: '',
  statusId: '',
  categoryId: '',
  onlyPrimary: false,
}

export function filterCompanyContacts(contacts, filters) {
  return contacts.filter((contact) => {
    if (filters.contactType && contact.contact_type !== filters.contactType) return false
    if (filters.areaId && contact.area_id !== filters.areaId) return false
    if (filters.onlyPrimary && !contact.is_primary) return false
    if (filters.statusId && contact.associate?.associate_status_id !== filters.statusId) {
      return false
    }
    if (filters.categoryId && contact.associate?.category_id !== filters.categoryId) {
      return false
    }
    return matchesSearch(contact, filters.search)
  })
}

export function hasCompanyContactFilters(filters) {
  return Boolean(
    filters.search ||
    filters.contactType ||
    filters.areaId ||
    filters.statusId ||
    filters.categoryId ||
    filters.onlyPrimary
  )
}

export function isRepresentativeContactType(contactType) {
  return REPRESENTATIVE_CONTACT_TYPES.includes(contactType)
}

export function getCompanyContactTypeLabel(contactType) {
  return COMPANY_CONTACT_TYPE_OPTIONS.find((option) => option.value === contactType)?.label || ''
}

export function toCompanyContactExportRow(contact) {
  return {
    contact_type: contact.contact_type_label,
    area: contact.area?.label || '',
    contact_name: contact.full_name,
    position: contact.position || '',
    email: contact.email || '',
    phone: contact.phone || '',
    dni: contact.dni || '',
    birthday: formatDateOnly(contact.birthday),
    is_primary_label: contact.is_primary ? 'Sí' : 'No',
    associate_name: contact.associate?.company_name || '',
    associate_code: contact.associate?.internal_code || '',
    associate_ruc: contact.associate?.ruc || '',
    associate_status: contact.associate?.associate_status?.label || '',
    category: contact.associate?.category?.name || '',
    primary_committee: contact.associate?.primary_committee?.name || '',
    notes: contact.notes || '',
  }
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
  ]
}
