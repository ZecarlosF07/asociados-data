/** Mapeo de códigos de estado de asociado a variantes de Badge */
export const ASSOCIATE_STATUS_VARIANT = {
  ACTIVO: 'success',
  INACTIVO: 'danger',
  SUSPENDIDO: 'warning',
  EN_PROCESO: 'info',
}

/** Mapeo de salud de pago a variantes de Badge */
export const PAYMENT_HEALTH_VARIANT = {
  AL_DIA: 'success',
  POR_VENCER: 'warning',
  MOROSO: 'danger',
  CRITICO: 'danger',
}

/** Etiquetas de los catalog groups usados en asociados */
export const ASSOCIATE_CATALOG_GROUPS = {
  STATUS: 'ASSOCIATE_STATUS',
  ACTIVITY_TYPE: 'ACTIVITY_TYPE',
  COMPANY_SIZE: 'COMPANY_SIZE',
  PERSON_ROLE: 'PERSON_ROLE',
  AREA: 'AREA',
  PAYMENT_HEALTH: 'PAYMENT_HEALTH',
}
