import { useState, useEffect, useCallback } from 'react'
import { prospectsService } from '../services/prospects.service'

export function useProspects() {
  const [prospects, setProspects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    statusId: '',
    categoryId: '',
    captadorId: '',
  })

  const fetchProspects = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await prospectsService.getAll(filters)
      setProspects(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchProspects()
  }, [fetchProspects])

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  return {
    prospects,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchProspects,
  }
}
