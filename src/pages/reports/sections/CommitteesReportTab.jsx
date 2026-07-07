import { useMemo, useState } from 'react'
import { Loader } from '../../../components/atoms/Loader'
import { CommitteeReportFilters } from '../../../components/molecules/reports/CommitteeReportFilters'
import { CommitteeReportKpis } from '../../../components/molecules/reports/CommitteeReportKpis'
import { DistributionChart } from '../../../components/molecules/reports/DistributionChart'
import { ReportSection } from '../../../components/molecules/reports/ReportSection'
import { ReportTable } from '../../../components/molecules/reports/ReportTable'
import { useNotification } from '../../../hooks/useNotification'
import { useReportData } from '../../../hooks/useReportData'
import { ROUTES } from '../../../router/routes'
import {
  buildCommitteeReportModel,
  buildCommitteeReportOptions,
  DEFAULT_COMMITTEE_REPORT_FILTERS,
} from '../../../utils/committeeReportUtils'
import { EXPORT_COLUMNS, exportMultiSheetExcel } from '../../../utils/exportUtils'
import { formatDate } from '../../../utils/helpers'
import { REPORT_TABLE_COLUMNS, reportFilename } from '../../../utils/reportConfigs'

export function CommitteesReportTab({ navigate }) {
  const [filters, setFilters] = useState(DEFAULT_COMMITTEE_REPORT_FILTERS)
  const { data, error, loading } = useReportData('committees')
  const { notify } = useNotification()
  const model = useMemo(() => buildCommitteeReportModel(data, filters), [data, filters])
  const options = useMemo(() => buildCommitteeReportOptions(data), [data])

  if (loading) return <div className="flex justify-center py-16"><Loader /></div>
  if (error) return <ReportError error={error} />

  const handleExport = async () => {
    try {
      await exportMultiSheetExcel({
        filename: reportFilename('reporte_comites', formatDate(new Date())),
        sheets: [
          buildSheet('Resumen comités', model.summaryRows, 'committeeSummary'),
          buildSheet('Asociados por comité', model.filteredAssociates, 'committeeAssociates'),
        ],
      })
      notify.success('Reporte de comités exportado')
    } catch (requestError) {
      notify.error(`No se pudo exportar: ${requestError.message}`)
    }
  }

  return (
    <div className="space-y-6">
      <CommitteeReportFilters
        filters={filters}
        options={options}
        onChange={(updates) => setFilters((current) => ({ ...current, ...updates }))}
        onClear={() => setFilters(DEFAULT_COMMITTEE_REPORT_FILTERS)}
      />
      <CommitteeReportKpis indicators={model.indicators} />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <DistributionChart title="Asociados por comité" data={model.distributionByCommittee} />
        <DistributionChart title="Asociados por estado" data={model.distributionByStatus} />
      </div>
      <ReportSection
        title="Resumen por comité"
        count={model.summaryRows.length}
        onExport={handleExport}
        exportDisabled={!model.summaryRows.length && !model.filteredAssociates.length}
      >
        <ReportTable columns={REPORT_TABLE_COLUMNS.committeeSummary} data={model.summaryRows} />
      </ReportSection>
      <ReportSection title="Asociados por comité" count={model.filteredAssociates.length}>
        <ReportTable
          columns={REPORT_TABLE_COLUMNS.committeeAssociates}
          data={model.filteredAssociates}
          onRowClick={(row) => navigate(`${ROUTES.ASOCIADOS}/${row.id}`)}
        />
      </ReportSection>
    </div>
  )
}

function buildSheet(sheetName, data, columnKey) {
  return { sheetName, data, columns: EXPORT_COLUMNS[columnKey] }
}

function ReportError({ error }) {
  return (
    <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
      No se pudo cargar el reporte de comités. {error}
    </div>
  )
}
