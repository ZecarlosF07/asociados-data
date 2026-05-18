import { useCallback, useEffect, useState } from 'react'
import { auditService } from '../services/audit.service'

const PAGE_SIZE = 50

const INITIAL_FILTERS = {
  actorUserId: '',
  entityName: '',
  actionType: '',
  dateFrom: '',
  dateTo: '',
}

export function useAuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [hasMore, setHasMore] = useState(false)
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  const fetchLogs = useCallback(async ({ offset = 0, append = false } = {}) => {
    if (append) setLoadingMore(true)
    else setLoading(true)

    setError(null)

    try {
      const { data, count } = await auditService.getAll({
        ...filters,
        limit: PAGE_SIZE,
        offset,
      })

      setLogs((prev) => (append ? mergeLogs(prev, data) : data))
      setHasMore(offset + data.length < count)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filters])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS)
  }, [])

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return
    fetchLogs({ offset: logs.length, append: true })
  }, [fetchLogs, hasMore, loadingMore, logs.length])

  return {
    logs,
    loading,
    loadingMore,
    error,
    filters,
    hasMore,
    updateFilters,
    clearFilters,
    loadMore,
    refetch: fetchLogs,
  }
}

function mergeLogs(previous, next) {
  const seen = new Set(previous.map((log) => log.id))
  const unique = next.filter((log) => !seen.has(log.id))
  return [...previous, ...unique]
}
