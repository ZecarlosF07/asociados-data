import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from './documentConstants'

/**
 * Validación del formulario de carga de documento
 */
export function validateDocumentUpload(form, file) {
  const errors = {}

  if (!form.title?.trim()) {
    errors.title = 'El título es obligatorio'
  }

  if (!file) {
    errors.file = 'Debe seleccionar un archivo'
  } else {
    const ext = file.name.split('.').pop()?.toLowerCase()

    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      errors.file = `Extensión no permitida (.${ext}). Extensiones válidas: ${ALLOWED_EXTENSIONS.join(', ')}`
    }

    if (file.size > MAX_FILE_SIZE) {
      errors.file = `El archivo excede el tamaño máximo de 20 MB`
    }
  }

  return errors
}

/**
 * Validación de metadatos de documento (edición)
 */
export function validateDocumentMetadata(form) {
  const errors = {}

  if (!form.title?.trim()) {
    errors.title = 'El título es obligatorio'
  }

  return errors
}
