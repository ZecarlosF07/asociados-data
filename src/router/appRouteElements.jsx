import { Route } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import { MainLayout } from '../layouts/MainLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { PermissionGuard } from './PermissionGuard'
import { adminRoutes } from './adminRoutes'
import { associateRoutes } from './associateRoutes'
import { lazyPage } from './lazyPage'
import { operationRoutes } from './operationRoutes'
import { prospectRoutes } from './prospectRoutes'
import { ROUTES } from './routes'
import { LandingRedirect } from './LandingRedirect'

const LoginPage = lazyPage(() => import('../pages/auth/LoginPage'), 'LoginPage')
const DashboardPage = lazyPage(() => import('../pages/dashboard/DashboardPage'), 'DashboardPage')
const NotFoundPage = lazyPage(() => import('../pages/NotFoundPage'), 'NotFoundPage')

export const appRouteElements = [
  <Route key="auth" element={<AuthLayout />}>
    <Route path={ROUTES.LOGIN} element={<LoginPage />} />
  </Route>,
  <Route key="app" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
    <Route path="/" element={<LandingRedirect />} />
    <Route path={ROUTES.DASHBOARD} element={<PermissionGuard module="dashboard"><DashboardPage /></PermissionGuard>} />
    {prospectRoutes}
    {associateRoutes}
    {operationRoutes}
    {adminRoutes}
  </Route>,
  <Route key="fallback" path="*" element={<NotFoundPage />} />,
]
