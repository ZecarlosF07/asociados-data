import { ROUTES } from '../router/routes'

export const APP_NAME = 'Sistema de Asociados'

export const NAVIGATION_ITEMS = [
  { label: 'Dashboard', path: ROUTES.DASHBOARD, icon: '📊' },
  { label: 'Prospectos', path: ROUTES.PROSPECTOS, icon: '🎯' },
  { label: 'Asociados', path: ROUTES.ASOCIADOS, icon: '🏢' },
  { label: 'Membresías', path: ROUTES.MEMBRESIAS, icon: '📋' },
  { label: 'Cobranza', path: ROUTES.COBRANZA, icon: '💰' },
  { label: 'Documentos', path: ROUTES.DOCUMENTOS, icon: '📁' },
  { label: 'Reportes', path: ROUTES.REPORTES, icon: '📈' },
  { label: 'Usuarios', path: ROUTES.USUARIOS, icon: '👥' },
  { label: 'Configuración', path: ROUTES.CONFIGURACION, icon: '⚙️' },
]

export const NOTIFICATION_DURATION = 4000

export const ERROR_MESSAGES = {
  GENERIC: 'Ocurrió un error inesperado',
  AUTH: 'Error de autenticación',
  NETWORK: 'Error de conexión',
  NOT_FOUND: 'Recurso no encontrado',
  FORBIDDEN: 'No tienes permisos para esta acción',
}
