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

  const date = parseDate(dateValue)
  if (!date) return false

  if (period.year && date.getFullYear() !== Number(period.year)) return false
  if (period.month && date.getMonth() + 1 !== Number(period.month)) return false

  return true
}

export function buildYearOptions(rows, datePath) {
  return [...new Set(
    (rows || [])
      .map((row) => parseDate(getNestedValue(row, datePath))?.getFullYear())
      .filter(Boolean)
  )].sort((a, b) => b - a)
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
    const date = parseDate(getNestedValue(row, datePath))
    if (!date) return

    const label = `${MONTH_OPTIONS[date.getMonth()].label} ${date.getFullYear()}`
    counts[label] = (counts[label] || 0) + 1
  })

  return counts
}

export function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

function parseDate(value) {
  if (!value) return null

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}
