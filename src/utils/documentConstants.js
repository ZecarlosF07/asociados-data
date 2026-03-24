/** Grupos de catálogo usados en documentos */
export const DOCUMENT_CATALOG_GROUPS = {
  DOCUMENT_TYPE: 'DOCUMENT_TYPE',
  DOCUMENT_CATEGORY: 'DOCUMENT_CATEGORY',
  NODE_TYPE: 'NODE_TYPE',
  DRIVE_SYNC_STATUS: 'DRIVE_SYNC_STATUS',
}

/** Extensiones de archivo permitidas */
export const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
  'jpg', 'jpeg', 'png', 'gif', 'webp',
  'csv', 'txt', 'zip', 'rar',
]

/** Tamaño máximo de archivo en bytes (20 MB) */
export const MAX_FILE_SIZE = 20 * 1024 * 1024

/** Formatea bytes a unidad legible */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`
}

/** Íconos por extensión de archivo */
export function getFileIcon(extension) {
  const ext = (extension || '').toLowerCase()
  const icons = {
    pdf: '📄',
    doc: '📝', docx: '📝',
    xls: '📊', xlsx: '📊',
    ppt: '📽️', pptx: '📽️',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️',
    csv: '📊',
    txt: '📝',
    zip: '📦', rar: '📦',
  }
  return icons[ext] || '📎'
}

/** Verifica si el archivo es una imagen */
export function isImageFile(mimeType) {
  return mimeType?.startsWith('image/')
}
