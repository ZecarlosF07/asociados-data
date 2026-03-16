import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from './routes'
import { ProtectedRoute } from './ProtectedRoute'
import { PermissionGuard } from './PermissionGuard'
import { MainLayout } from '../layouts/MainLayout'
import { AuthLayout } from '../layouts/AuthLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { UsersPage } from '../pages/users/UsersPage'
import { SettingsPage } from '../pages/settings/SettingsPage'
import { CatalogsPage } from '../pages/settings/CatalogsPage'
import { CategoriesPage } from '../pages/settings/CategoriesPage'
import { ProspectsPage } from '../pages/prospects/ProspectsPage'
import { ProspectCreatePage } from '../pages/prospects/ProspectCreatePage'
import { ProspectDetailPage } from '../pages/prospects/ProspectDetailPage'
import { ProspectEditPage } from '../pages/prospects/ProspectEditPage'
import { AssociatesPage } from '../pages/associates/AssociatesPage'
import { AssociateDetailPage } from '../pages/associates/AssociateDetailPage'
import { AssociateEditPage } from '../pages/associates/AssociateEditPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export function AppRouter() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}
