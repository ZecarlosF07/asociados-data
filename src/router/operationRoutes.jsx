import { Route } from 'react-router-dom'
import { PermissionGuard } from './PermissionGuard'
import { ROUTES } from './routes'
import { lazyPage } from './lazyPage'

const MembershipsPage = lazyPage(() => import('../pages/financial/MembershipsPage'), 'MembershipsPage')
const PendingPaymentsPage = lazyPage(() => import('../pages/financial/PendingPaymentsPage'), 'PendingPaymentsPage')
const DocumentsPage = lazyPage(() => import('../pages/documents/DocumentsPage'), 'DocumentsPage')
const DocumentDetailPage = lazyPage(() => import('../pages/documents/DocumentDetailPage'), 'DocumentDetailPage')
const ReportsPage = lazyPage(() => import('../pages/reports/ReportsPage'), 'ReportsPage')
const AuditPage = lazyPage(() => import('../pages/audit/AuditPage'), 'AuditPage')

export const operationRoutes = [
  guardedRoute('memberships', ROUTES.MEMBRESIAS, 'membresias', <MembershipsPage />),
  guardedRoute('collections', ROUTES.COBRANZA, 'cobranza', <PendingPaymentsPage />),
  guardedRoute('documents', ROUTES.DOCUMENTOS, 'documentos', <DocumentsPage />),
  guardedRoute('document-detail', ROUTES.DOCUMENTOS_DETALLE, 'documentos', <DocumentDetailPage />),
  guardedRoute('reports', ROUTES.REPORTES, 'reportes', <ReportsPage />),
  guardedRoute('audit', ROUTES.AUDITORIA, 'auditoria', <AuditPage />),
]

function guardedRoute(key, path, module, page) {
  return <Route key={key} path={path} element={<PermissionGuard module={module}>{page}</PermissionGuard>} />
}
