import { compareDateOnly } from './dateOnly'

/**
 * Validación del formulario de membresía
 */
export function validateMembershipForm(form, options = {}) {
  const errors = {}

  if (!form.membership_type_id) {
    errors.membership_type_id = 'El tipo de membresía es obligatorio'
  }

  if (!form.fee_amount || Number(form.fee_amount) <= 0) {
    errors.fee_amount = 'La tarifa debe ser mayor a 0'
  }

  if (!form.start_date) {
    errors.start_date = 'La fecha de inicio es obligatoria'
  }

  if (
    form.start_date &&
    form.end_date &&
    compareDateOnly(form.end_date, form.start_date) < 0
  ) {
    errors.end_date = 'La fecha de fin no puede ser anterior al inicio'
  }

  if (options.isMonthly) {
    const billingDay = Number(form.monthly_billing_day)

    if (!form.monthly_billing_day) {
      errors.monthly_billing_day = 'El día de cobro es obligatorio'
    } else if (!Number.isInteger(billingDay) || billingDay < 1 || billingDay > 28) {
      errors.monthly_billing_day = 'El día de cobro debe estar entre 1 y 28'
    }
  }

  if (!form.membership_status_id) {
    errors.membership_status_id = 'El estado es obligatorio'
  }

  return errors
}

/**
 * Validación del formulario de pago
 */
export function validatePaymentForm(form, options = {}) {
  const errors = {}

  if (options.requireSchedule && !form.payment_schedule_id) {
    errors.payment_schedule_id = 'La cuota a pagar es obligatoria'
  }

  if (!form.payment_date) {
    errors.payment_date = 'La fecha de pago es obligatoria'
  }

  if (!form.amount_paid || Number(form.amount_paid) <= 0) {
    errors.amount_paid = 'El monto debe ser mayor a 0'
  }

  if (!form.operation_code?.trim()) {
    errors.operation_code = 'El código de operación es obligatorio'
  }

  return errors
}

/**
 * Validación del formulario de acción de cobranza
 */
export function validateCollectionActionForm(form) {
  const errors = {}

  if (!form.contact_type_id) {
    errors.contact_type_id = 'El tipo de contacto es obligatorio'
  }

  if (!form.subject?.trim()) {
    errors.subject = 'El asunto es obligatorio'
  }

  return errors
}
