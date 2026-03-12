import { useUserProfile } from './useUserProfile'
import { hasPermission, canAction } from '../utils/permissions'

export function usePermissions() {
  const { roleCode } = useUserProfile()

  return {
    roleCode,
    hasPermission: (module) => hasPermission(roleCode, module),
    canCreate: canAction(roleCode, 'canCreate'),
    canEdit: canAction(roleCode, 'canEdit'),
    canDelete: canAction(roleCode, 'canDelete'),
    isAdmin: roleCode === 'ADMIN',
  }
}
