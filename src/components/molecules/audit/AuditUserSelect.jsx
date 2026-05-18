import { useEffect, useState } from 'react'
import { userProfilesService } from '../../../services/userProfiles.service'

export function AuditUserSelect({ value, onChange }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    async function fetchUsers() {
      setLoading(true)
      setError(null)
      try {
        const data = await userProfilesService.getAll()
        if (mounted) setUsers(data)
      } catch (err) {
        if (mounted) setError(err.message)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchUsers()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <select
      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
      value={value || ''}
      onChange={onChange}
      disabled={loading}
    >
      <option value="">
        {loading ? 'Cargando...' : error || 'Todos los usuarios'}
      </option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {formatUserOption(user)}
        </option>
      ))}
    </select>
  )
}

function formatUserOption(user) {
  const name = `${user.first_name} ${user.last_name}`.trim()
  const role = user.roles?.name ? ` - ${user.roles.name}` : ''
  const status = user.is_active ? '' : ' - Inactivo'
  return `${name || user.institutional_email}${role}${status}`
}
