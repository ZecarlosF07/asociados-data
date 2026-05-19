import { Badge } from '../../atoms/Badge'
import { Button } from '../../atoms/Button'

export function buildUserColumns({ onEdit, onResetPassword }) {
  return [
    { key: 'first_name', label: 'Nombres' },
    { key: 'last_name', label: 'Apellidos' },
    { key: 'institutional_email', label: 'Correo' },
    { key: 'dni', label: 'DNI' },
    {
      key: 'roles',
      label: 'Rol',
      render: (value) => <Badge variant="info">{value?.name || '—'}</Badge>,
    },
    {
      key: 'is_active',
      label: 'Estado',
      render: (value) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (_value, row) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={() => onEdit(row)}>
            Editar
          </Button>
          <Button size="sm" variant="secondary" onClick={() => onResetPassword(row)}>
            Contraseña
          </Button>
        </div>
      ),
    },
  ]
}
