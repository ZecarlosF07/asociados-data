import { useState, useEffect, useCallback } from 'react'
import { reportsService } from '../services/reports.service'

/**
 * Hook para cargar datos de un reporte específico.
 * @param {'prospects'|'associates'|'memberships'|'payments'|'schedules'|'collections'|'documents'|'kpis'} reportType
 */
export function useReportData(reportType) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      let result

      switch (reportType) {
        case 'prospects':
          result = await reportsService.getProspectsSummary()
          break
        case 'associates':
          result = await reportsService.getAssociatesSummary()
          break
        case 'memberships':
          result = await reportsService.getMembershipsSummary()
          break
        case 'payments':
          result = await reportsService.getPaymentsSummary()
          break
        case 'schedules':
          result = await reportsService.getSchedulesSummary()
          break
        case 'collections':
          result = await reportsService.getCollectionActionsSummary()
          break
        case 'documents':
          result = await reportsService.getDocumentsSummary()
          break
        case 'kpis':
          result = await reportsService.getDashboardKpis()
          break
        default:
          result = []
      }

      setData(result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [reportType])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
