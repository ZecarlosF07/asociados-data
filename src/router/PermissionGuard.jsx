import { usePermissions } from '../hooks/usePermissions'
import { AccessDeniedPage } from '../pages/auth/AccessDeniedPage'

export function PermissionGuard({ module, children }) {
  const { hasPermission } = usePermissions()

  if (!hasPermission(module)) {
    return <AccessDeniedPage />
  }

  return children
}
