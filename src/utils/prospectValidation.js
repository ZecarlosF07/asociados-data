/** Validación del formulario de prospecto */
export function validateProspectForm(form) {
  const errors = {}

  if (!form.company_name?.trim()) {
    errors.company_name = 'La razón social es obligatoria'
  }

  if (form.ruc && !/^\d{11}$/.test(form.ruc)) {
    errors.ruc = 'El RUC debe tener 11 dígitos'
  }

  if (form.primary_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.primary_email)) {
    errors.primary_email = 'El correo no es válido'
  }

  if (!form.captador_id) {
    errors.captador_id = 'El captador es obligatorio'
  }

  return errors
}

/** Validación del formulario de cotización */
export function validateQuoteForm(form) {
  const errors = {}

  if (!form.quoted_amount || Number(form.quoted_amount) <= 0) {
    errors.quoted_amount = 'El monto es obligatorio y debe ser mayor a 0'
  }

  if (!form.quote_status_id) {
    errors.quote_status_id = 'El estado es obligatorio'
  }

  return errors
}
