import { Route } from 'react-router-dom'
import { PermissionGuard } from './PermissionGuard'
import { ROUTES } from './routes'
import { lazyPage } from './lazyPage'

const ProspectsPage = lazyPage(() => import('../pages/prospects/ProspectsPage'), 'ProspectsPage')
const ProspectCreatePage = lazyPage(() => import('../pages/prospects/ProspectCreatePage'), 'ProspectCreatePage')
const ProspectDetailPage = lazyPage(() => import('../pages/prospects/ProspectDetailPage'), 'ProspectDetailPage')
const ProspectEditPage = lazyPage(() => import('../pages/prospects/ProspectEditPage'), 'ProspectEditPage')

export const prospectRoutes = [
  <Route key="prospects" path={ROUTES.PROSPECTOS} element={<PermissionGuard module="prospectos"><ProspectsPage /></PermissionGuard>} />,
  <Route key="prospects-new" path={ROUTES.PROSPECTOS_NUEVO} element={<PermissionGuard module="prospectos"><ProspectCreatePage /></PermissionGuard>} />,
  <Route key="prospects-detail" path={ROUTES.PROSPECTOS_DETALLE} element={<PermissionGuard module="prospectos"><ProspectDetailPage /></PermissionGuard>} />,
  <Route key="prospects-edit" path={ROUTES.PROSPECTOS_EDITAR} element={<PermissionGuard module="prospectos"><ProspectEditPage /></PermissionGuard>} />,
]
