import { useState, useEffect, useCallback } from 'react'
import { userProfilesService } from '../services/userProfiles.service'

export function useActiveUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await userProfilesService.getAll()
      // Solo usuarios activos
      setUsers(data.filter((u) => u.is_active))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const getFullName = useCallback(
    (id) => {
      const user = users.find((u) => u.id === id)
      if (!user) return ''
      return `${user.first_name} ${user.last_name}`
    },
    [users]
  )

  return { users, loading, error, getFullName }
}
