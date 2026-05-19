import { auditService } from '../services/audit.service'

export async function logProfileChange(previousUser, updatedUser, actorUserId) {
  const actionType = resolveUserAction(previousUser, updatedUser)

  await auditService.log({
    actorUserId,
    entityName: 'user_profiles',
    entityId: updatedUser.id,
    actionType,
    previousData: sanitizeUser(previousUser),
    newData: sanitizeUser(updatedUser),
    summary: buildUserSummary(actionType, updatedUser),
    extraMeta: { source: 's13_user_generation' },
  })
}

function resolveUserAction(previousUser, updatedUser) {
  if (previousUser.role_id !== updatedUser.role_id) return 'change_user_role'
  if (previousUser.is_active && !updatedUser.is_active) return 'deactivate_user'
  if (!previousUser.is_active && updatedUser.is_active) return 'reactivate_user'
  return 'update_user_profile'
}

function buildUserSummary(actionType, user) {
  const name = `${user.first_name} ${user.last_name}`
  const summaries = {
    change_user_role: `Rol actualizado para ${name}`,
    deactivate_user: `Usuario desactivado: ${name}`,
    reactivate_user: `Usuario reactivado: ${name}`,
    update_user_profile: `Perfil de usuario actualizado: ${name}`,
  }
  return summaries[actionType]
}

function sanitizeUser(user) {
  return {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    institutional_email: user.institutional_email,
    dni: user.dni,
    role_id: user.role_id,
    role: user.roles?.code,
    is_active: user.is_active,
    notes: user.notes,
  }
}
