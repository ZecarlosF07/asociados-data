import { useState, useEffect, useCallback } from 'react'
import { associatesService } from '../services/associates.service'

export function useAssociateDetail(associateId) {
  const [associate, setAssociate] = useState(null)
  const [people, setPeople] = useState([])
  const [areaContacts, setAreaContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    if (!associateId) return

    setLoading(true)
    setError(null)

    try {
      const [associateData, peopleData, contactsData] = await Promise.all([
        associatesService.getById(associateId),
        associatesService.getPeople(associateId),
        associatesService.getAreaContacts(associateId),
      ])

      setAssociate(associateData)
      setPeople(peopleData)
      setAreaContacts(contactsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [associateId])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    associate,
    people,
    areaContacts,
    loading,
    error,
    refetch: fetchAll,
  }
}
