import { useCallback, useEffect, useState } from 'react'
import { committeesService } from '../services/committees.service'

export function useCommittees({ activeOnly = false, search = '' } = {}) {
  const [committees, setCommittees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setCommittees(await committeesService.getAll({ activeOnly, search }))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [activeOnly, search])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { committees, error, loading, refetch }
}
