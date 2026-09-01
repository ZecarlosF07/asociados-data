import { describe, expect, it } from 'vitest'
import { toCompanyContactExportRow } from './companyContactUtils'
import { EXPORT_COLUMNS } from './exportUtils'

const EXPECTED_COLUMNS = [
  'RUC',
  'Asociados',
  'Categoría',
  'Comité principal',
  'Tipo de contacto',
  'Área',
  'Contacto',
  'Cargo',
  'Email',
  'Teléfono',
]

describe('exportación de contactos', () => {
  it('mantiene únicamente las columnas solicitadas y en el orden acordado', () => {
    expect(EXPORT_COLUMNS.companyContacts.map(({ label }) => label)).toEqual(EXPECTED_COLUMNS)
  })

  it('transforma un contacto al contrato reducido del Excel', () => {
    const row = toCompanyContactExportRow({
      contact_type_label: 'Contacto por área',
      full_name: 'María Torres',
      position: 'Gerente comercial',
      email: 'maria@example.com',
      phone: '999888777',
      area: { label: 'Comercial' },
      associate: {
        ruc: '20123456789',
        company_name: 'Empresa Demo S.A.C.',
        category: { name: 'Categoría B - Empresarial' },
        primary_committee: { name: 'Servicios' },
      },
    })

    expect(row).toEqual({
      associate_ruc: '20123456789',
      associate_name: 'Empresa Demo S.A.C.',
      category: 'Categoría B - Empresarial',
      primary_committee: 'Servicios',
      contact_type: 'Contacto por área',
      area: 'Comercial',
      contact_name: 'María Torres',
      position: 'Gerente comercial',
      email: 'maria@example.com',
      phone: '999888777',
    })
  })
})
