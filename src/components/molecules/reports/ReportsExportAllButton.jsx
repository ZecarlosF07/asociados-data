import { useState } from 'react'
import { Button } from '../../atoms/Button'
import { useNotification } from '../../../hooks/useNotification'
import { reportsService } from '../../../services/reports.service'
import {
  buildCommitteeReportModel,
  DEFAULT_COMMITTEE_REPORT_FILTERS,
} from '../../../utils/committeeReportUtils'
import { EXPORT_COLUMNS, exportMultiSheetExcel } from '../../../utils/exportUtils'
import { formatDate } from '../../../utils/helpers'
import { reportFilename } from '../../../utils/reportConfigs'

export function ReportsExportAllButton() {
  const [loading, setLoading] = useState(false)
  const { notify } = useNotification()

  const handleExport = async () => {
    setLoading(true)
    try {
      const data = await loadAllReports()
      const committees = buildCommitteeReportModel(
        data.committees,
        DEFAULT_COMMITTEE_REPORT_FILTERS
      )

      await exportMultiSheetExcel({
        filename: reportFilename('reporte_completo', formatDate(new Date())),
        sheets: buildSheets(data, committees),
      })
      notify.success('Reporte completo exportado')
    } catch (error) {
      notify.error(`No se pudo exportar: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExport} loading={loading}>
      📥 Exportar todo
    </Button>
  )
}

async function loadAllReports() {
  const [prospects, associates, memberships, payments, schedules, collections, documents, committees] =
    await Promise.all([
      reportsService.getProspectsSummary(),
      reportsService.getAssociatesSummary(),
      reportsService.getMembershipsSummary(),
      reportsService.getPaymentsSummary(),
      reportsService.getSchedulesSummary(),
      reportsService.getCollectionActionsSummary(),
      reportsService.getDocumentsSummary(),
      reportsService.getCommitteesReport(),
    ])

  return { prospects, associates, memberships, payments, schedules, collections, documents, committees }
}

function buildSheets(data, committees) {
  return [
    sheet('Prospectos', data.prospects, 'prospects'),
    sheet('Asociados', data.associates, 'associates'),
    sheet('Membresías', data.memberships, 'memberships'),
    sheet('Pagos', data.payments, 'payments'),
    sheet('Cronograma', data.schedules, 'schedules'),
    sheet('Gestiones', data.collections, 'collections'),
    sheet('Documentos', data.documents, 'documents'),
    sheet('Resumen comités', committees.summaryRows, 'committeeSummary'),
    sheet('Asociados por comité', committees.filteredAssociates, 'committeeAssociates'),
  ]
}

function sheet(sheetName, data, columnKey) {
  return { sheetName, data, columns: EXPORT_COLUMNS[columnKey] }
}
