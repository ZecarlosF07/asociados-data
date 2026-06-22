import { getDateOnlyParts, isBeforeDateOnly, todayDateOnly } from './dateOnly'

export const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function getCurrentMonthFilter() {
  const today = getDateOnlyParts(todayDateOnly())
  return {
    month: today.month,
    year: today.year,
  }
}

export function getSchedulePeriodLabel(schedule) {
  if (!schedule) return '—'

  return schedule.period_month
    ? `${String(schedule.period_month).padStart(2, '0')}/${schedule.period_year}`
    : String(schedule.period_year)
}

export function isScheduleOverdue(schedule, today = todayDateOnly()) {
  return isBeforeDateOnly(schedule.due_date, today)
}

export function getScheduleDisplayStatus(schedule) {
  const statusCode = schedule.collection_status?.code

  if (statusCode === 'ANULADO') {
    return buildStoredScheduleStatus(schedule)
  }

  if (schedule.is_paid || statusCode === 'PAGADO') {
    return { code: 'PAGADO', label: 'Pagado' }
  }

  if (statusCode === 'PARCIAL' || statusCode === 'EN_GESTION') {
    return buildStoredScheduleStatus(schedule)
  }

  if (isScheduleOverdue(schedule)) {
    return { code: 'VENCIDO', label: 'Vencido' }
  }

  return { code: 'PENDIENTE', label: 'Pendiente' }
}

export function filterPaymentSchedules(
  schedules,
  { selectedMonth, selectedYear, showAllMonths, search, paymentTypeId }
) {
  let result = schedules

  if (!showAllMonths) {
    result = result.filter((schedule) => {
      const due = getDateOnlyParts(schedule.due_date)
      return due.month === selectedMonth && due.year === selectedYear
    })
  }

  if (paymentTypeId) {
    result = result.filter(
      (schedule) => schedule.membership?.membership_type_id === paymentTypeId
    )
  }

  if (!search) return result

  const term = search.toLowerCase()
  return result.filter(
    (schedule) =>
      schedule.associate?.company_name?.toLowerCase().includes(term) ||
      schedule.associate?.ruc?.includes(term) ||
      schedule.associate?.internal_code?.toLowerCase().includes(term)
  )
}

export function splitSchedulesByDueDate(schedules) {
  const today = todayDateOnly()

  return {
    overdue: schedules.filter((schedule) => isScheduleOverdue(schedule, today)),
    upcoming: schedules.filter((schedule) => !isScheduleOverdue(schedule, today)),
  }
}

export function sumExpectedAmount(schedules) {
  return schedules.reduce(
    (sum, schedule) => sum + Number(schedule.expected_amount || 0),
    0
  )
}

function buildStoredScheduleStatus(schedule) {
  return {
    code: schedule.collection_status?.code || 'PENDIENTE',
    label: schedule.collection_status?.label || 'Pendiente',
  }
}
