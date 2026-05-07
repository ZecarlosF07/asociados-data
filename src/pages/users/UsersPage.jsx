import { useCallback, useEffect, useState } from 'react'
import { userProfilesService } from '../../services/userProfiles.service'
import { useNotification } from '../../hooks/useNotification'
import { DataTable } from '../../components/organisms/DataTable'
import { Badge } from '../../components/atoms/Badge'
import { Button } from '../../components/atoms/Button'

const COLUMNS = [
  { key: 'first_name', label: 'Nombres' },
  { key: 'last_name', label: 'Apellidos' },
  { key: 'institutional_email', label: 'Correo' },
  { key: 'dni', label: 'DNI' },
  {
    key: 'roles',
    label: 'Rol',
    render: (value) => (
      <Badge variant="info">{value?.name || '—'}</Badge>
    ),
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
]

export function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const { notify } = useNotification()

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await userProfilesService.getAll()
      setUsers(data)
    } catch (error) {
      notify.error('Error al cargar usuarios: ' + error.message)
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  return (
    <div className="max-w-5xl">
      <div className="mb-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Usuarios</h1>
            <p className="text-sm text-slate-400">
              Gestión de usuarios y perfiles del sistema
            </p>
          </div>
          <Button variant="primary" onClick={() => notify.info('Crear usuario: funcionalidad pendiente')}>
            Nuevo usuario
          </Button>
        </div>
      </div>

      <DataTable
        columns={COLUMNS}
        data={users}
        loading={loading}
        emptyMessage="No hay usuarios registrados"
      />
    </div>
  )
}
