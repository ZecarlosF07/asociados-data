import { Route } from 'react-router-dom'
import { PermissionGuard } from './PermissionGuard'
import { ROUTES } from './routes'
import { lazyPage } from './lazyPage'

const AssociatesPage = lazyPage(() => import('../pages/associates/AssociatesPage'), 'AssociatesPage')
const AssociateCreatePage = lazyPage(() => import('../pages/associates/AssociateCreatePage'), 'AssociateCreatePage')
const AssociateDetailPage = lazyPage(() => import('../pages/associates/AssociateDetailPage'), 'AssociateDetailPage')
const AssociateEditPage = lazyPage(() => import('../pages/associates/AssociateEditPage'), 'AssociateEditPage')
const CompanyContactsPage = lazyPage(() => import('../pages/contacts/CompanyContactsPage'), 'CompanyContactsPage')
const CommitteesPage = lazyPage(() => import('../pages/committees/CommitteesPage'), 'CommitteesPage')
const CommitteeDetailPage = lazyPage(() => import('../pages/committees/CommitteeDetailPage'), 'CommitteeDetailPage')

export const associateRoutes = [
  <Route key="associates" path={ROUTES.ASOCIADOS} element={<PermissionGuard module="asociados"><AssociatesPage /></PermissionGuard>} />,
  <Route key="associates-new" path={ROUTES.ASOCIADOS_NUEVO} element={<PermissionGuard module="asociados"><AssociateCreatePage /></PermissionGuard>} />,
  <Route key="associates-detail" path={ROUTES.ASOCIADOS_DETALLE} element={<PermissionGuard module="asociados"><AssociateDetailPage /></PermissionGuard>} />,
  <Route key="associates-edit" path={ROUTES.ASOCIADOS_EDITAR} element={<PermissionGuard module="asociados"><AssociateEditPage /></PermissionGuard>} />,
  <Route key="company-contacts" path={ROUTES.CONTACTOS_EMPRESAS} element={<PermissionGuard module="asociados"><CompanyContactsPage /></PermissionGuard>} />,
  <Route key="committees" path={ROUTES.COMITES} element={<PermissionGuard module="comites"><CommitteesPage /></PermissionGuard>} />,
  <Route key="committees-detail" path={ROUTES.COMITES_DETALLE} element={<PermissionGuard module="comites"><CommitteeDetailPage /></PermissionGuard>} />,
]
