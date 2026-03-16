/** Mapeo de códigos de estado de prospecto a variantes de Badge */
export const PROSPECT_STATUS_VARIANT = {
  NUEVO: 'info',
  EN_EVALUACION: 'warning',
  COTIZADO: 'info',
  EN_SEGUIMIENTO: 'warning',
  APROBADO: 'success',
  CONVERTIDO: 'success',
  DESCARTADO: 'danger',
}

/** Mapeo de códigos de estado de cotización a variantes de Badge */
export const QUOTE_STATUS_VARIANT = {
  BORRADOR: 'default',
  EMITIDA: 'info',
  ENVIADA: 'warning',
  ACEPTADA: 'success',
  RECHAZADA: 'danger',
  VENCIDA: 'danger',
}

/** Etiquetas de los catalog groups usados en prospectos */
export const PROSPECT_CATALOG_GROUPS = {
  STATUS: 'PROSPECT_STATUS',
  ACTIVITY_TYPE: 'ACTIVITY_TYPE',
  COMPANY_SIZE: 'COMPANY_SIZE',
  QUOTE_STATUS: 'QUOTE_STATUS',
}
