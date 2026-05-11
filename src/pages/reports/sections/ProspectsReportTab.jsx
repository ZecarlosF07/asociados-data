import { DistributionChart } from '../../../components/molecules/reports/DistributionChart'
import { ReportSection } from '../../../components/molecules/reports/ReportSection'
import { ReportTable } from '../../../components/molecules/reports/ReportTable'
import { Loader } from '../../../components/atoms/Loader'
import { useReportData } from '../../../hooks/useReportData'
import { ROUTES } from '../../../router/routes'
import { exportToExcel, EXPORT_COLUMNS } from '../../../utils/exportUtils'
import { formatDate } from '../../../utils/helpers'
import { REPORT_TABLE_COLUMNS, reportFilename } from '../../../utils/reportConfigs'

export function ProspectsReportTab({ navigate }) {
  const { data, loading } = useReportData('prospects')

  if (loading) return <LoadingState />

  const handleExport = () =>
    exportToExcel({
      filename: reportFilename('prospectos', formatDate(new Date())),
      sheetName: 'Prospectos',
      data: data || [],
      columns: EXPORT_COLUMNS.prospects,
    })

  const byStatus = {}
  data?.forEach((p) => {
    const code = p.prospect_status?.label || 'Sin estado'
    byStatus[code] = (byStatus[code] || 0) + 1
  })

  return (
    <div className="space-y-6">
      <DistributionChart title="Distribución por estado" data={byStatus} />
      <ReportSection
        title="Listado de prospectos"
        count={data?.length}
        onExport={handleExport}
      >
        <ReportTable
          columns={REPORT_TABLE_COLUMNS.prospects}
          data={data}
          onRowClick={(row) => navigate(`${ROUTES.PROSPECTOS}/${row.id}`)}
        />
      </ReportSection>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex justify-center py-16">
      <Loader />
    </div>
  )
}
