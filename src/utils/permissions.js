export const ROLES = {
  ADMIN: 'ADMIN',
  CAPTACION: 'CAPTACION',
  FACTURACION: 'FACTURACION',
  FIDELIZACION: 'FIDELIZACION',
  ALTA_DIRECCION: 'ALTA_DIRECCION',
}

export const ACTIONS = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  ADMIN: 'admin',
}

export const MODULES = {
  DASHBOARD: 'dashboard',
  PROSPECTOS: 'prospectos',
  ASOCIADOS: 'asociados',
  MEMBRESIAS: 'membresias',
  COBRANZA: 'cobranza',
  COMITES: 'comites',
  DOCUMENTOS: 'documentos',
  REPORTES: 'reportes',
  USUARIOS: 'usuarios',
  CONFIGURACION: 'configuracion',
  AUDITORIA: 'auditoria',
}

const ALL_ACTIONS = Object.values(ACTIONS)
const OPERATIVE_ACTIONS = [ACTIONS.READ, ACTIONS.CREATE, ACTIONS.UPDATE]

export const PERMISSIONS = {
  [ROLES.ADMIN]: grantAll(),
  [ROLES.CAPTACION]: {
    [MODULES.PROSPECTOS]: OPERATIVE_ACTIONS,
  },
  [ROLES.FACTURACION]: {
    [MODULES.MEMBRESIAS]: [ACTIONS.READ],
    [MODULES.COBRANZA]: OPERATIVE_ACTIONS,
  },
  [ROLES.FIDELIZACION]: {
    [MODULES.PROSPECTOS]: OPERATIVE_ACTIONS,
    [MODULES.ASOCIADOS]: OPERATIVE_ACTIONS,
    [MODULES.MEMBRESIAS]: OPERATIVE_ACTIONS,
    [MODULES.COBRANZA]: OPERATIVE_ACTIONS,
    [MODULES.COMITES]: OPERATIVE_ACTIONS,
    [MODULES.DOCUMENTOS]: OPERATIVE_ACTIONS,
  },
  [ROLES.ALTA_DIRECCION]: {
    [MODULES.REPORTES]: [ACTIONS.READ],
    [MODULES.AUDITORIA]: [ACTIONS.READ],
  },
}

export function hasPermission(roleCode, module) {
  return canAction(roleCode, module, ACTIONS.READ)
}

export function canAction(roleCode, module, action) {
  const modulePermissions = PERMISSIONS[roleCode]?.[module]
  if (!modulePermissions) return false
  return modulePermissions.includes(action)
}

function grantAll() {
  return Object.values(MODULES).reduce((acc, module) => {
    acc[module] = ALL_ACTIONS
    return acc
  }, {})
}
