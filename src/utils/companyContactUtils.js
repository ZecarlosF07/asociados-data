import { formatDateOnly } from './dateOnly.js'

export const COMPANY_CONTACT_SOURCES = {
  AREA_CONTACT: 'AREA_CONTACT',
  ASSOCIATE_PERSON: 'ASSOCIATE_PERSON',
}

export const COMPANY_CONTACT_TYPES = {
  AREA_CONTACT: 'AREA_CONTACT',
  LEGAL_REPRESENTATIVE: 'REPRESENTANTE_LEGAL',
  CHAMBER_REPRESENTATIVE: 'REPRESENTANTE_ANTE_CAMARA',
}

export const REPRESENTATIVE_CONTACT_TYPES = [
  COMPANY_CONTACT_TYPES.LEGAL_REPRESENTATIVE,
  COMPANY_CONTACT_TYPES.CHAMBER_REPRESENTATIVE,
]

export function getCompanyContactTypeLabel(contactType) {
  const labels = {
    [COMPANY_CONTACT_TYPES.AREA_CONTACT]: 'Contacto por área',
    [COMPANY_CONTACT_TYPES.LEGAL_REPRESENTATIVE]: 'Representante legal',
    [COMPANY_CONTACT_TYPES.CHAMBER_REPRESENTATIVE]: 'Representante ante la Cámara',
  }
  return labels[contactType] || ''
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
