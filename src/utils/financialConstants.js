/** Mapeo de estado de membresía a variantes de Badge */
export const MEMBERSHIP_STATUS_VARIANT = {
  VIGENTE: 'success',
  VENCIDA: 'danger',
  CANCELADA: 'danger',
  RENOVADA: 'info',
}

/** Mapeo de estado de cobranza a variantes de Badge */
export const COLLECTION_STATUS_VARIANT = {
  PENDIENTE: 'warning',
  EN_GESTION: 'info',
  PARCIAL: 'warning',
  PAGADO: 'success',
  VENCIDO: 'danger',
  ANULADO: 'default',
}

/** Mapeo de resultado de cobranza a variantes de Badge */
export const COLLECTION_RESULT_VARIANT = {
  CONTACTADO: 'success',
  NO_CONTACTADO: 'danger',
  COMPROMISO_PAGO: 'info',
  RECHAZO: 'danger',
  SIN_RESPUESTA: 'warning',
}

/** Etiquetas de los catalog groups usados en membresías/pagos/cobranza */
export const FINANCIAL_CATALOG_GROUPS = {
  MEMBERSHIP_TYPE: 'MEMBERSHIP_TYPE',
  MEMBERSHIP_STATUS: 'MEMBERSHIP_STATUS',
  PAYMENT_METHOD: 'PAYMENT_METHOD',
  COLLECTION_STATUS: 'COLLECTION_STATUS',
  COLLECTION_RESULT: 'COLLECTION_RESULT',
  CONTACT_TYPE: 'CONTACT_TYPE',
  PAYMENT_HEALTH: 'PAYMENT_HEALTH',
}

/** Configuración de cuotas para membresías de cobertura anual */
export const MEMBERSHIP_PAYMENT_FREQUENCIES = {
  MENSUAL: { installments: 12, intervalMonths: 1, requiresBillingDay: true },
  TRIMESTRAL: { installments: 4, intervalMonths: 3, requiresBillingDay: true },
  CUATRIMESTRAL: { installments: 3, intervalMonths: 4, requiresBillingDay: true },
  SEMESTRAL: { installments: 2, intervalMonths: 6, requiresBillingDay: true },
  ANUAL: { installments: 1, intervalMonths: 12, requiresBillingDay: false },
}

export function getMembershipPaymentFrequency(code) {
  return MEMBERSHIP_PAYMENT_FREQUENCIES[code] || null
}

export function requiresMembershipBillingDay(code) {
  return Boolean(getMembershipPaymentFrequency(code)?.requiresBillingDay)
}
