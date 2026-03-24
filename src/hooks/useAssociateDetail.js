import { useState, useEffect, useCallback } from 'react'
import { associatesService } from '../services/associates.service'
import { membershipsService } from '../services/memberships.service'
import { paymentSchedulesService } from '../services/paymentSchedules.service'
import { paymentsService } from '../services/payments.service'
import { collectionActionsService } from '../services/collectionActions.service'
import { documentsService } from '../services/documents.service'

export function useAssociateDetail(associateId) {
  const [associate, setAssociate] = useState(null)
  const [people, setPeople] = useState([])
  const [areaContacts, setAreaContacts] = useState([])
  const [memberships, setMemberships] = useState([])
  const [schedules, setSchedules] = useState([])
  const [payments, setPayments] = useState([])
  const [collectionActions, setCollectionActions] = useState([])
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    if (!associateId) return

    setLoading(true)
    setError(null)

    try {
      const [
        associateData,
        peopleData,
        contactsData,
        membershipsData,
        schedulesData,
        paymentsData,
        collectionsData,
        documentsData,
      ] = await Promise.all([
        associatesService.getById(associateId),
        associatesService.getPeople(associateId),
        associatesService.getAreaContacts(associateId),
        membershipsService.getByAssociate(associateId),
        paymentSchedulesService.getByAssociate(associateId),
        paymentsService.getByAssociate(associateId),
        collectionActionsService.getByAssociate(associateId),
        documentsService.getByAssociate(associateId),
      ])

      setAssociate(associateData)
      setPeople(peopleData)
      setAreaContacts(contactsData)
      setMemberships(membershipsData)
      setSchedules(schedulesData)
      setPayments(paymentsData)
      setCollectionActions(collectionsData)
      setDocuments(documentsData)
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
    memberships,
    schedules,
    payments,
    collectionActions,
    documents,
    loading,
    error,
    refetch: fetchAll,
  }
}
