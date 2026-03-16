/**
 * Validación del formulario de asociado
 */
export function validateAssociateForm(form) {
  const errors = {}

  if (!form.company_name?.trim()) {
    errors.company_name = 'La razón social es obligatoria'
  }

  if (!form.ruc?.trim()) {
    errors.ruc = 'El RUC es obligatorio'
  } else if (!/^\d{11}$/.test(form.ruc.trim())) {
    errors.ruc = 'El RUC debe tener 11 dígitos'
  }

  if (form.corporate_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.corporate_email)) {
    errors.corporate_email = 'Correo electrónico inválido'
  }

  return errors
}

/**
 * Validación del formulario de conversión desde prospecto
 */
export function validateConversionForm(form) {
  const errors = {}

  if (!form.ruc?.trim()) {
    errors.ruc = 'El RUC es obligatorio para la conversión'
  } else if (!/^\d{11}$/.test(form.ruc.trim())) {
    errors.ruc = 'El RUC debe tener 11 dígitos'
  }

  if (!form.statusId) {
    errors.statusId = 'El estado inicial es obligatorio'
  }

  if (!form.associationDate) {
    errors.associationDate = 'La fecha de asociación es obligatoria'
  }

  return errors
}

/**
 * Validación del formulario de persona vinculada
 */
export function validatePersonForm(form) {
  const errors = {}

  if (!form.full_name?.trim()) {
    errors.full_name = 'El nombre es obligatorio'
  }

  if (!form.person_role_id) {
    errors.person_role_id = 'El tipo de persona es obligatorio'
  }

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Correo electrónico inválido'
  }

  return errors
}

/**
 * Validación del formulario de contacto por área
 */
export function validateAreaContactForm(form) {
  const errors = {}

  if (!form.full_name?.trim()) {
    errors.full_name = 'El nombre es obligatorio'
  }

  if (!form.area_id) {
    errors.area_id = 'El área es obligatoria'
  }

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Correo electrónico inválido'
  }

  return errors
}
