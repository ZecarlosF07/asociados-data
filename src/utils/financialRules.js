import { compareDateOnly } from './dateOnly'

export function deriveMembershipStatus(membership, today) {
  const storedCode = membership.stored_status_code || membership.membership_status?.code
  const endDate = membership.effective_end_date || membership.end_date

  if (storedCode === 'CANCELADA') return 'CANCELADA'
  if (compareDateOnly(membership.start_date, today) > 0) return 'PROGRAMADA'
  if (compareDateOnly(membership.start_date, today) <= 0 && compareDateOnly(endDate, today) >= 0) {
    return 'VIGENTE'
  }
  if (membership.successor_membership_id || storedCode === 'RENOVADA') return 'RENOVADA'
  return 'VENCIDA'
}

export function allocateInstallmentAmounts(feeAmount, installments) {
  const totalCents = Math.round(Number(feeAmount) * 100)
  if (!Number.isInteger(installments) || installments <= 0 || totalCents <= 0) {
    throw new Error('La tarifa y el número de cuotas deben ser positivos.')
  }

  const baseCents = Math.floor(totalCents / installments)
  return Array.from({ length: installments }, (_, index) => (
    index === installments - 1
      ? (totalCents - baseCents * (installments - 1)) / 100
      : baseCents / 100
  ))
}

export function getOutstandingAmount(expectedAmount, paidAmount) {
  return Math.max(
    Math.round((Number(expectedAmount || 0) - Number(paidAmount || 0)) * 100) / 100,
    0
  )
}

export function isCollectibleSchedule(schedule) {
  return schedule.membership_effective_status_code !== 'PROGRAMADA' &&
    schedule.financial_status_code !== 'ANULADO' &&
    Number(schedule.outstanding_amount || 0) > 0
}
