import { Route } from 'react-router-dom'
import { PermissionGuard } from './PermissionGuard'
import { ROUTES } from './routes'
import { lazyPage } from './lazyPage'

const UsersPage = lazyPage(() => import('../pages/users/UsersPage'), 'UsersPage')
const SettingsPage = lazyPage(() => import('../pages/settings/SettingsPage'), 'SettingsPage')
const CatalogsPage = lazyPage(() => import('../pages/settings/CatalogsPage'), 'CatalogsPage')
const CategoriesPage = lazyPage(() => import('../pages/settings/CategoriesPage'), 'CategoriesPage')

export const adminRoutes = [
  guardedRoute('users', ROUTES.USUARIOS, 'usuarios', <UsersPage />),
  guardedRoute('settings', ROUTES.CONFIGURACION, 'configuracion', <SettingsPage />),
  guardedRoute('catalogs', ROUTES.CATALOGOS, 'configuracion', <CatalogsPage />),
  guardedRoute('categories', ROUTES.CATEGORIAS, 'configuracion', <CategoriesPage />),
]

function guardedRoute(key, path, module, page) {
  return <Route key={key} path={path} element={<PermissionGuard module={module}>{page}</PermissionGuard>} />
}
