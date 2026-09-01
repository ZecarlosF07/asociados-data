import { useCallback, useEffect, useMemo, useState } from 'react'
import { membershipsService } from '../services/memberships.service'
import {
  DEFAULT_MEMBERSHIP_LIST_FILTERS,
  filterMemberships,
  hasMembershipFilters,
  selectEffectiveMemberships,
} from '../utils/membershipListFilters'

export function useActiveMemberships() {
  const [memberships, setMemberships] = useState([])
  const [filters, setFilters] = useState({ ...DEFAULT_MEMBERSHIP_LIST_FILTERS })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchMemberships = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      setMemberships(await membershipsService.getAll())
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las membresías vigentes.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMemberships()
  }, [fetchMemberships])

  const activeMemberships = useMemo(
    () => selectEffectiveMemberships(memberships),
    [memberships]
  )
  const filteredMemberships = useMemo(
    () => filterMemberships(activeMemberships, filters),
    [activeMemberships, filters]
  )

  const updateFilters = useCallback((updates) => {
    setFilters((current) => ({ ...current, ...updates }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({ ...DEFAULT_MEMBERSHIP_LIST_FILTERS })
  }, [])

  return {
    clearFilters,
    error,
    filteredMemberships,
    filters,
    hasFilters: hasMembershipFilters(filters),
    loading,
    refetch: fetchMemberships,
    totalActiveCount: activeMemberships.length,
    updateFilters,
  }
}
