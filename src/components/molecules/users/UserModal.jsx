import { Modal } from '../../organisms/Modal'
import { UserForm } from './UserForm'

export function UserModal({
  isOpen,
  mode,
  user,
  roles,
  loading,
  onClose,
  onSubmit,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Nuevo usuario' : 'Editar usuario'}
      size="lg"
    >
      <UserForm
        mode={mode}
        initialData={user}
        roles={roles}
        loading={loading}
        onSubmit={onSubmit}
        onCancel={onClose}
      />
    </Modal>
  )
}
