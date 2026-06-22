import { useCallback, useEffect, useState } from 'react'
import { committeesService } from '../services/committees.service'

export function useCommitteeDetail(committeeId) {
  const [committee, setCommittee] = useState(null)
  const [associates, setAssociates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!committeeId) return
    setLoading(true)
    setError(null)
    try {
      const [committeeData, associateData] = await Promise.all([
        committeesService.getById(committeeId),
        committeesService.getCurrentAssociates(committeeId),
      ])
      setCommittee(committeeData)
      setAssociates(associateData)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [committeeId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { associates, committee, error, loading, refetch }
}
