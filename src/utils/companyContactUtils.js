export const DEFAULT_COMPANY_CONTACT_FILTERS = {
  search: '',
  areaId: '',
  statusId: '',
  categoryId: '',
  onlyPrimary: false,
}

export function filterCompanyContacts(contacts, filters) {
  return contacts.filter((contact) => {
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
    filters.areaId ||
    filters.statusId ||
    filters.categoryId ||
    filters.onlyPrimary
  )
}

export function toCompanyContactExportRow(contact) {
  return {
    contact_name: contact.full_name,
    area: contact.area?.label || '',
    position: contact.position || '',
    email: contact.email || '',
    phone: contact.phone || '',
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
    contact.associate?.company_name,
    contact.associate?.ruc,
    contact.associate?.internal_code,
  ]
}
