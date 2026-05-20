import { getDateOnlyParts, isDateOnly, todayDateOnly } from './dateOnly'

export const MONTH_OPTIONS = [
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
]

export function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
}

export function matchesSearch(row, search, paths) {
  const term = normalizeText(search)
  if (!term) return true

  return paths.some((path) =>
    normalizeText(getNestedValue(row, path)).includes(term)
  )
}

export function filterByPeriod(row, datePath, period) {
  const dateValue = getNestedValue(row, datePath)
  if (!dateValue) return false

  const dateParts = getPeriodParts(dateValue)
  if (!dateParts) return false

  if (period.year && dateParts.year !== Number(period.year)) return false
  if (period.month && dateParts.month !== Number(period.month)) return false

  return true
}

export function buildYearOptions(rows, datePath) {
  return [...new Set(
    (rows || [])
      .map((row) => getPeriodParts(getNestedValue(row, datePath))?.year)
      .filter(Boolean)
  )].sort((a, b) => b - a)
}

export function buildPeriodYearOptions(rows, datePath, selectedYear = currentPeriod().year) {
  return [...new Set([Number(selectedYear), ...buildYearOptions(rows, datePath)])]
    .filter(Boolean)
    .sort((a, b) => b - a)
}

export function currentPeriod() {
  const now = getDateOnlyParts(todayDateOnly())
  return {
    year: String(now.year),
    month: String(now.month),
  }
}

export function defaultPeriodFilters(extra = {}) {
  return {
    search: '',
    ...currentPeriod(),
    ...extra,
  }
}

export function buildCategoryOptions(rows) {
  const categories = new Map()

  ;(rows || []).forEach((row) => {
    const code = row.category?.code || row.category?.name
    const label = row.category?.name
    if (code && label) categories.set(code, label)
  })

  return [...categories.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label))
}

export function groupByMonth(rows, datePath) {
  const counts = {}

  ;(rows || []).forEach((row) => {
    const dateParts = getPeriodParts(getNestedValue(row, datePath))
    if (!dateParts) return

    const label = `${MONTH_OPTIONS[dateParts.month - 1].label} ${dateParts.year}`
    counts[label] = (counts[label] || 0) + 1
  })

  return counts
}

export function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

function getPeriodParts(value) {
  if (!value) return null

  if (isDateOnly(value)) {
    return getDateOnlyParts(value)
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  }
}
