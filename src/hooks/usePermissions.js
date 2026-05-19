import { useUserProfile } from './useUserProfile'
import { ACTIONS, hasPermission, canAction } from '../utils/permissions'

export function usePermissions() {
  const { roleCode } = useUserProfile()
  const canModuleAction = (module, action) => canAction(roleCode, module, action)

  return {
    roleCode,
    hasPermission: (module) => hasPermission(roleCode, module),
    canAction: canModuleAction,
    canCreate: (module) => canModuleAction(module, ACTIONS.CREATE),
    canEdit: (module) => canModuleAction(module, ACTIONS.UPDATE),
    canDelete: (module) => canModuleAction(module, ACTIONS.DELETE),
    isAdmin: roleCode === 'ADMIN',
  }
}
