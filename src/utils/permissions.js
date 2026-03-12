export const ROLES = {
  ADMIN: 'ADMIN',
  OPERADOR: 'OPERADOR',
  CONSULTA: 'CONSULTA',
}

export const PERMISSIONS = {
  [ROLES.ADMIN]: {
    dashboard: true,
    prospectos: true,
    asociados: true,
    membresias: true,
    cobranza: true,
    documentos: true,
    reportes: true,
    usuarios: true,
    configuracion: true,
    auditoria: true,
    canCreate: true,
    canEdit: true,
    canDelete: true,
  },
  [ROLES.OPERADOR]: {
    dashboard: true,
    prospectos: true,
    asociados: true,
    membresias: true,
    cobranza: true,
    documentos: true,
    reportes: true,
    usuarios: false,
    configuracion: false,
    auditoria: false,
    canCreate: true,
    canEdit: true,
    canDelete: false,
  },
  [ROLES.CONSULTA]: {
    dashboard: true,
    prospectos: true,
    asociados: true,
    membresias: true,
    cobranza: true,
    documentos: true,
    reportes: true,
    usuarios: false,
    configuracion: false,
    auditoria: false,
    canCreate: false,
    canEdit: false,
    canDelete: false,
  },
}

export function hasPermission(roleCode, module) {
  const rolePermissions = PERMISSIONS[roleCode]
  if (!rolePermissions) return false
  return rolePermissions[module] === true
}

export function canAction(roleCode, action) {
  const rolePermissions = PERMISSIONS[roleCode]
  if (!rolePermissions) return false
  return rolePermissions[action] === true
}
