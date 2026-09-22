import { describe, expect, it } from 'vitest'
import { getOffboardingImpact } from './associateOffboarding'

describe('baja administrativa S23', () => {
  it('resume membresías, comités y deuda devengada sin contar obligaciones futuras', () => {
    const associate = { committee_assignments: [
      { is_active: true, is_deleted: false },
      { is_active: false, is_deleted: false },
    ] }
    const memberships = [
      { membership_status: { code: 'VIGENTE' } },
      { membership_status: { code: 'PROGRAMADA' } },
      { membership_status: { code: 'CANCELADA' } },
    ]
    const schedules = [
      { due_date: '2026-09-01', outstanding_amount: 200, is_collectible: true },
      { due_date: '2026-09-23', outstanding_amount: 500, is_collectible: true },
      { due_date: '2026-08-01', outstanding_amount: 100, is_collectible: false },
    ]
    expect(getOffboardingImpact(associate, memberships, schedules, '2026-09-22')).toEqual({
      currentCount: 1,
      scheduledCount: 1,
      committeeCount: 1,
      dueDebt: 200,
      requiresMembershipPermission: true,
    })
  })

  it('permite formalizar la baja sin membresía operativa', () => {
    expect(getOffboardingImpact({ committee_assignments: [] }, [
      { membership_status: { code: 'VENCIDA' } },
    ], [], '2026-09-22').requiresMembershipPermission).toBe(false)
  })
})
