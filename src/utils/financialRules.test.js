import { describe, expect, it } from 'vitest'
import { addDaysToDateOnly, addYearsToDateOnly, todayDateOnly } from './dateOnly'
import {
  allocateInstallmentAmounts,
  deriveMembershipStatus,
  getOutstandingAmount,
  isCollectibleSchedule,
} from './financialRules'

describe('reglas financieras S22', () => {
  it('distingue vigente, vencida y programada usando fechas de negocio', () => {
    expect(deriveMembershipStatus({ start_date: '2026-06-01', end_date: '2027-05-31' }, '2026-09-01')).toBe('VIGENTE')
    expect(deriveMembershipStatus({ start_date: '2025-06-01', end_date: '2026-05-31' }, '2026-09-01')).toBe('VENCIDA')
    expect(deriveMembershipStatus({ start_date: '2026-10-01', end_date: '2027-09-30' }, '2026-09-01')).toBe('PROGRAMADA')
  })

  it('muestra renovada solo después de terminar su cobertura efectiva', () => {
    const membership = {
      start_date: '2026-01-01',
      effective_end_date: '2026-09-30',
      stored_status_code: 'RENOVADA',
      successor_membership_id: 'next',
    }
    expect(deriveMembershipStatus(membership, '2026-09-01')).toBe('VIGENTE')
    expect(deriveMembershipStatus(membership, '2026-10-01')).toBe('RENOVADA')
  })

  it('asigna el redondeo restante a la última cuota', () => {
    const amounts = allocateInstallmentAmounts(1000, 3)
    expect(amounts).toEqual([333.33, 333.33, 333.34])
    expect(amounts.reduce((sum, amount) => sum + amount, 0)).toBeCloseTo(1000)
  })

  it('calcula el saldo y excluye membresías programadas o cuotas anuladas', () => {
    expect(getOutstandingAmount(1000, 400)).toBe(600)
    expect(isCollectibleSchedule({
      membership_effective_status_code: 'VIGENTE',
      financial_status_code: 'PARCIAL',
      outstanding_amount: 600,
    })).toBe(true)
    expect(isCollectibleSchedule({
      membership_effective_status_code: 'PROGRAMADA',
      financial_status_code: 'PENDIENTE',
      outstanding_amount: 1000,
    })).toBe(false)
    expect(isCollectibleSchedule({
      membership_effective_status_code: 'RENOVADA',
      financial_status_code: 'VENCIDO',
      outstanding_amount: 250,
    })).toBe(true)
    expect(isCollectibleSchedule({
      membership_effective_status_code: 'CANCELADA',
      financial_status_code: 'ANULADO',
      outstanding_amount: 250,
    })).toBe(false)
  })

  it('calcula hoy con la zona America/Lima', () => {
    expect(todayDateOnly(new Date('2026-09-02T03:30:00Z'))).toBe('2026-09-01')
  })

  it('mantiene el cierre anual esperado para un inicio en año bisiesto', () => {
    const endDate = addDaysToDateOnly(addYearsToDateOnly('2024-02-29', 1), -1)
    expect(endDate).toBe('2025-02-28')
  })
})
