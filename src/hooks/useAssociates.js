import { useState, useEffect, useCallback } from 'react'
import { associatesService } from '../services/associates.service'

export function useAssociates() {
  const [associates, setAssociates] = useState([])
  const [activeCount, setActiveCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: '',
    statusId: '',
    categoryId: '',
    committeeId: '',
    withoutCommittee: false,
  })

  const fetchAssociates = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [data, count, active] = await Promise.all([
        associatesService.getAll(filters),
        associatesService.getTotalCount(),
        associatesService.getActiveCount(),
      ])
      setAssociates(data)
      setTotalCount(count)
      setActiveCount(active)
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
    activeCount,
    associates,
    filteredCount: associates.length,
    hasFilters: hasAssociateFilters(filters),
    totalCount,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchAssociates,
  }
}

function hasAssociateFilters(filters) {
  return Boolean(
    filters.search.trim() ||
    filters.statusId ||
    filters.categoryId ||
    filters.committeeId ||
    filters.withoutCommittee
  )
}
