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
