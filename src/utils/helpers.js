import { formatDateOnly, isDateOnly } from './dateOnly'

export function formatDate(date) {
  if (!date) return ''
  if (isDateOnly(date)) return formatDateOnly(date)

  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date) {
  if (!date) return ''
  return new Intl.DateTimeFormat('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatCurrency(amount) {
  if (amount == null) return ''
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
  }).format(amount)
}

export function truncateText(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
