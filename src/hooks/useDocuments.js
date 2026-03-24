import { useState, useEffect, useCallback } from 'react'
import { documentsService } from '../services/documents.service'

export function useDocuments({ associateId, search, categoryId, typeId } = {}) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let data

      if (associateId) {
        data = await documentsService.getByAssociate(associateId)
      } else {
        data = await documentsService.getAll({ search, categoryId, typeId })
      }

      setDocuments(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [associateId, search, categoryId, typeId])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
  }
}
