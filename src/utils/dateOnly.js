const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/

export function isDateOnly(value) {
  return typeof value === 'string' && DATE_ONLY_RE.test(value)
}

export function parseDateOnly(value) {
  if (!isDateOnly(value)) return null

  const [, year, month, day] = value.match(DATE_ONLY_RE)
  const parts = {
    year: Number(year),
    month: Number(month),
    day: Number(day),
  }

  const date = new Date(parts.year, parts.month - 1, parts.day)
  if (
    date.getFullYear() !== parts.year ||
    date.getMonth() + 1 !== parts.month ||
    date.getDate() !== parts.day
  ) {
    return null
  }

  return parts
}

export function getDateOnlyParts(value) {
  const parts = parseDateOnly(value)
  if (!parts) throw new Error(`Fecha calendario inválida: ${value}`)
  return parts
}

export function buildDateOnly(year, month, day) {
  return toDateOnlyString(new Date(year, month - 1, day))
}

export function toDateOnlyString(value) {
  if (isDateOnly(value)) return value

  if (value instanceof Date) {
    return [
      value.getFullYear(),
      pad2(value.getMonth() + 1),
      pad2(value.getDate()),
    ].join('-')
  }

  if (value && typeof value === 'object') {
    return buildDateOnly(value.year, value.month, value.day)
  }

  return ''
}

export function formatDateOnly(value) {
  const parts = parseDateOnly(value)
  if (!parts) return ''
  return `${pad2(parts.day)}/${pad2(parts.month)}/${parts.year}`
}

export function todayDateOnly() {
  return toDateOnlyString(new Date())
}

export function startOfCurrentMonthDateOnly() {
  const today = new Date()
  return buildDateOnly(today.getFullYear(), today.getMonth() + 1, 1)
}

export function addDaysToDateOnly(value, days) {
  const { year, month, day } = getDateOnlyParts(value)
  return toDateOnlyString(new Date(year, month - 1, day + days))
}

export function addMonthsToDateOnly(value, months) {
  const { year, month, day } = getDateOnlyParts(value)
  return buildDateOnly(year, month + months, day)
}

export function addYearsToDateOnly(value, years) {
  return addMonthsToDateOnly(value, years * 12)
}

export function compareDateOnly(a, b) {
  return normalizeDateOnly(a).localeCompare(normalizeDateOnly(b))
}

export function isBeforeDateOnly(a, b) {
  return compareDateOnly(a, b) < 0
}

function normalizeDateOnly(value) {
  if (isDateOnly(value)) return value
  if (value instanceof Date) return toDateOnlyString(value)
  throw new Error(`Fecha calendario inválida: ${value}`)
}

function pad2(value) {
  return String(value).padStart(2, '0')
}
