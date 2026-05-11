import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from './routes'
import { ProtectedRoute } from './ProtectedRoute'
import { PermissionGuard } from './PermissionGuard'
import { MainLayout } from '../layouts/MainLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { Loader } from '../components/atoms/Loader'

const LoginPage = lazyPage(() => import('../pages/auth/LoginPage'), 'LoginPage')
const DashboardPage = lazyPage(() => import('../pages/dashboard/DashboardPage'), 'DashboardPage')
const UsersPage = lazyPage(() => import('../pages/users/UsersPage'), 'UsersPage')
const SettingsPage = lazyPage(() => import('../pages/settings/SettingsPage'), 'SettingsPage')
const CatalogsPage = lazyPage(() => import('../pages/settings/CatalogsPage'), 'CatalogsPage')
const CategoriesPage = lazyPage(() => import('../pages/settings/CategoriesPage'), 'CategoriesPage')
const ProspectsPage = lazyPage(() => import('../pages/prospects/ProspectsPage'), 'ProspectsPage')
const ProspectCreatePage = lazyPage(() => import('../pages/prospects/ProspectCreatePage'), 'ProspectCreatePage')
const ProspectDetailPage = lazyPage(() => import('../pages/prospects/ProspectDetailPage'), 'ProspectDetailPage')
const ProspectEditPage = lazyPage(() => import('../pages/prospects/ProspectEditPage'), 'ProspectEditPage')
const AssociatesPage = lazyPage(() => import('../pages/associates/AssociatesPage'), 'AssociatesPage')
const AssociateDetailPage = lazyPage(() => import('../pages/associates/AssociateDetailPage'), 'AssociateDetailPage')
const AssociateEditPage = lazyPage(() => import('../pages/associates/AssociateEditPage'), 'AssociateEditPage')
const MembershipsPage = lazyPage(() => import('../pages/financial/MembershipsPage'), 'MembershipsPage')
const PendingPaymentsPage = lazyPage(() => import('../pages/financial/PendingPaymentsPage'), 'PendingPaymentsPage')
const DocumentsPage = lazyPage(() => import('../pages/documents/DocumentsPage'), 'DocumentsPage')
const DocumentDetailPage = lazyPage(() => import('../pages/documents/DocumentDetailPage'), 'DocumentDetailPage')
const ReportsPage = lazyPage(() => import('../pages/reports/ReportsPage'), 'ReportsPage')
const NotFoundPage = lazyPage(() => import('../pages/NotFoundPage'), 'NotFoundPage')

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
        {/* Rutas de autenticación */}
        <Route element={<AuthLayout />}>
          <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        </Route>

        {/* Rutas protegidas */}
        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />

          {/* Prospectos */}
          <Route
            path={ROUTES.PROSPECTOS}
            element={
              <PermissionGuard module="prospectos">
                <ProspectsPage />
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.PROSPECTOS_NUEVO}
            element={
              <PermissionGuard module="prospectos">
                <ProspectCreatePage />
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.PROSPECTOS_DETALLE}
            element={
              <PermissionGuard module="prospectos">
                <ProspectDetailPage />
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.PROSPECTOS_EDITAR}
            element={
              <PermissionGuard module="prospectos">
                <ProspectEditPage />
              </PermissionGuard>
            }
          />

          {/* Asociados */}
          <Route
            path={ROUTES.ASOCIADOS}
            element={
              <PermissionGuard module="asociados">
                <AssociatesPage />
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.ASOCIADOS_DETALLE}
            element={
              <PermissionGuard module="asociados">
                <AssociateDetailPage />
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.ASOCIADOS_EDITAR}
            element={
              <PermissionGuard module="asociados">
                <AssociateEditPage />
              </PermissionGuard>
            }
          />

          {/* Membresías */}
          <Route
            path={ROUTES.MEMBRESIAS}
            element={
              <PermissionGuard module="membresias">
                <MembershipsPage />
              </PermissionGuard>
            }
          />

          {/* Cobranza */}
          <Route
            path={ROUTES.COBRANZA}
            element={
              <PermissionGuard module="cobranza">
                <PendingPaymentsPage />
              </PermissionGuard>
            }
          />

          {/* Documentos */}
          <Route
            path={ROUTES.DOCUMENTOS}
            element={
              <PermissionGuard module="documentos">
                <DocumentsPage />
              </PermissionGuard>
            }
          />
          <Route
            path={ROUTES.DOCUMENTOS_DETALLE}
            element={
              <PermissionGuard module="documentos">
                <DocumentDetailPage />
              </PermissionGuard>
            }
          />

          {/* Reportes */}
          <Route
            path={ROUTES.REPORTES}
            element={
              <PermissionGuard module="reportes">
                <ReportsPage />
              </PermissionGuard>
            }
          />

          {/* Usuarios */}
          <Route
            path={ROUTES.USUARIOS}
            element={
              <PermissionGuard module="usuarios">
                <UsersPage />
              </PermissionGuard>
            }
          />

          {/* Configuración */}
          <Route
            path={ROUTES.CONFIGURACION}
            element={
              <PermissionGuard module="configuracion">
                <SettingsPage />
              </PermissionGuard>
            }
          />

          <Route
            path={ROUTES.CATALOGOS}
            element={
              <PermissionGuard module="configuracion">
                <CatalogsPage />
              </PermissionGuard>
            }
          />

          <Route
            path={ROUTES.CATEGORIAS}
            element={
              <PermissionGuard module="configuracion">
                <CategoriesPage />
              </PermissionGuard>
            }
          />
        </Route>

        {/* Redirecciones y fallbacks */}
        <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

function lazyPage(loader, exportName) {
  return lazy(() =>
    loader().then((module) => ({ default: module[exportName] }))
  )
}

function RouteLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader />
    </div>
  )
}
