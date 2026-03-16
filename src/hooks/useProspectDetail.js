import { useState, useEffect, useCallback } from 'react'
import { prospectsService } from '../services/prospects.service'
import { prospectEvaluationsService } from '../services/prospectEvaluations.service'
import { prospectQuotesService } from '../services/prospectQuotes.service'

export function useProspectDetail(prospectId) {
  const [prospect, setProspect] = useState(null)
  const [evaluations, setEvaluations] = useState([])
  const [quotes, setQuotes] = useState([])
  const [statusHistory, setStatusHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    if (!prospectId) return

    setLoading(true)
    setError(null)

    try {
      const [prospectData, evalsData, quotesData, historyData] =
        await Promise.all([
          prospectsService.getById(prospectId),
          prospectEvaluationsService.getByProspect(prospectId),
          prospectQuotesService.getByProspect(prospectId),
          prospectsService.getStatusHistory(prospectId),
        ])

      setProspect(prospectData)
      setEvaluations(evalsData)
      setQuotes(quotesData)
      setStatusHistory(historyData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [prospectId])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  return {
    prospect,
    evaluations,
    quotes,
    statusHistory,
    loading,
    error,
    refetch: fetchAll,
  }
}
