import { Button } from '../../components/atoms/Button'
import { DataTable } from '../../components/organisms/DataTable'
import { PasswordResetModal } from '../../components/molecules/users/PasswordResetModal'
import { UserModal } from '../../components/molecules/users/UserModal'
import { buildUserColumns } from '../../components/molecules/users/userTableColumns'
import { useUserManagement } from '../../hooks/useUserManagement'

export function UsersPage() {
  const manager = useUserManagement()
  const columns = buildUserColumns({
    onEdit: manager.openEditModal,
    onResetPassword: manager.setPasswordUser,
  })

  return (
    <div className="max-w-6xl">
      <div className="mb-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Usuarios</h1>
            <p className="text-sm text-slate-400">
              Gestión de usuarios, roles y acceso interno.
            </p>
          </div>
          <Button variant="primary" onClick={manager.openCreateModal}>
            Nuevo usuario
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={manager.users}
        loading={manager.loading}
        emptyMessage="No hay usuarios registrados"
      />

      <UserModal
        isOpen={!!manager.modalMode}
        mode={manager.modalMode || 'create'}
        user={manager.selectedUser}
        roles={manager.roles}
        loading={manager.actionLoading}
        onClose={manager.closeUserModal}
        onSubmit={
          manager.modalMode === 'create'
            ? manager.createUser
            : manager.updateUser
        }
      />

      <PasswordResetModal
        isOpen={!!manager.passwordUser}
        user={manager.passwordUser}
        loading={manager.actionLoading}
        onClose={() => manager.setPasswordUser(null)}
        onSubmit={manager.resetPassword}
      />
    </div>
  )
}
