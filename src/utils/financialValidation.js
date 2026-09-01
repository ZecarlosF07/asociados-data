import { requiresMembershipBillingDay } from './financialConstants'

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

  if (requiresMembershipBillingDay(options.membershipTypeCode)) {
    const billingDay = Number(form.monthly_billing_day)

    if (!form.monthly_billing_day) {
      errors.monthly_billing_day = 'El día de cobro es obligatorio'
    } else if (!Number.isInteger(billingDay) || billingDay < 1 || billingDay > 28) {
      errors.monthly_billing_day = 'El día de cobro debe estar entre 1 y 28'
    }
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
  } else if (options.maxDate && form.payment_date > options.maxDate) {
    errors.payment_date = 'La fecha de pago no puede estar en el futuro'
  } else if (options.minDate && form.payment_date < options.minDate) {
    errors.payment_date = 'La fecha de pago no puede ser anterior al inicio de la membresía'
  }

  if (!form.amount_paid || Number(form.amount_paid) <= 0) {
    errors.amount_paid = 'El monto debe ser mayor a 0'
  } else if (options.maxAmount != null && Number(form.amount_paid) > Number(options.maxAmount)) {
    errors.amount_paid = `El monto no puede superar el saldo de S/ ${Number(options.maxAmount).toFixed(2)}`
  }

  if (!form.operation_code?.trim()) {
    errors.operation_code = 'El N° de Factura es obligatorio'
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
