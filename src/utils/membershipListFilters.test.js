import { describe, expect, it } from 'vitest'
import {
  DEFAULT_MEMBERSHIP_LIST_FILTERS,
  filterMemberships,
  hasMembershipFilters,
  selectEffectiveMemberships,
} from './membershipListFilters'

const memberships = [
  buildMembership({ id: 'active-current', status: 'VIGENTE', isCurrent: true }),
  buildMembership({
    id: 'active-with-renewal',
    status: 'VIGENTE',
    isCurrent: false,
    companyName: 'Empresa Norte',
    typeId: 'quarterly',
    categoryId: 'category-b',
  }),
  buildMembership({ id: 'expired-current', status: 'VENCIDA', isCurrent: true }),
  buildMembership({ id: 'cancelled', status: 'CANCELADA', isCurrent: false }),
  buildMembership({ id: 'renewed', status: 'RENOVADA', isCurrent: false }),
  buildMembership({ id: 'scheduled', status: 'PROGRAMADA', isCurrent: true }),
]

describe('membershipListFilters', () => {
  it('selecciona solo membresías efectivamente vigentes', () => {
    expect(selectEffectiveMemberships(memberships).map(({ id }) => id)).toEqual([
      'active-current',
      'active-with-renewal',
    ])
  })

  it('mantiene una vigente aunque no sea el registro administrativo más reciente', () => {
    const active = selectEffectiveMemberships(memberships)
    expect(active.some(({ id }) => id === 'active-with-renewal')).toBe(true)
  })

  it('combina búsqueda, tipo y categoría con AND', () => {
    const active = selectEffectiveMemberships(memberships)
    const result = filterMemberships(active, {
      search: 'norte',
      typeId: 'quarterly',
      categoryId: 'category-b',
    })

    expect(result.map(({ id }) => id)).toEqual(['active-with-renewal'])
  })

  it('reconoce filtros activos y el estado limpio', () => {
    expect(hasMembershipFilters(DEFAULT_MEMBERSHIP_LIST_FILTERS)).toBe(false)
    expect(hasMembershipFilters({ ...DEFAULT_MEMBERSHIP_LIST_FILTERS, categoryId: 'category-a' }))
      .toBe(true)
  })
})

function buildMembership({
  categoryId = 'category-a',
  companyName = 'Empresa Central',
  id,
  isCurrent,
  status,
  typeId = 'annual',
}) {
  return {
    id,
    effective_status_code: status,
    is_current: isCurrent,
    associate: {
      company_name: companyName,
      internal_code: `A-${id}`,
      ruc: `20${id}`,
    },
    category: { id: categoryId },
    membership_type: { id: typeId },
  }
}
