import { useCallback, useEffect, useMemo, useState } from 'react'
import { companyContactsService } from '../services/companyContacts.service'
import {
  DEFAULT_COMPANY_CONTACT_FILTERS,
  filterCompanyContacts,
  hasCompanyContactFilters,
} from '../utils/companyContactUtils'

export function useCompanyContacts() {
  const [contacts, setContacts] = useState([])
  const [error, setError] = useState('')
  const [filters, setFilters] = useState(DEFAULT_COMPANY_CONTACT_FILTERS)
  const [loading, setLoading] = useState(true)

  const fetchContacts = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await companyContactsService.getAll()
      setContacts(data)
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los contactos.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchContacts()
  }, [fetchContacts])

  const updateFilters = useCallback((updates) => {
    setFilters((current) => ({ ...current, ...updates }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_COMPANY_CONTACT_FILTERS)
  }, [])

  const filteredContacts = useMemo(
    () => filterCompanyContacts(contacts, filters),
    [contacts, filters]
  )

  return {
    clearFilters,
    contacts,
    error,
    filteredContacts,
    filters,
    hasFilters: hasCompanyContactFilters(filters),
    loading,
    refetch: fetchContacts,
    updateFilters,
  }
}
