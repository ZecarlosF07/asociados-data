import { useState, useEffect, useCallback } from 'react'
import { associatesService } from '../services/associates.service'

export function useAssociates() {
  const [associates, setAssociates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    statusId: '',
    categoryId: '',
  })

  const fetchAssociates = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await associatesService.getAll(filters)
      setAssociates(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchAssociates()
  }, [fetchAssociates])

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  return {
    associates,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchAssociates,
  }
}
