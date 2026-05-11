import { DistributionChart } from '../../../components/molecules/reports/DistributionChart'
import { ReportSection } from '../../../components/molecules/reports/ReportSection'
import { ReportTable } from '../../../components/molecules/reports/ReportTable'
import { Loader } from '../../../components/atoms/Loader'
import { useReportData } from '../../../hooks/useReportData'
import { ROUTES } from '../../../router/routes'
import { exportToExcel, EXPORT_COLUMNS } from '../../../utils/exportUtils'
import { formatDate } from '../../../utils/helpers'
import { REPORT_TABLE_COLUMNS, reportFilename } from '../../../utils/reportConfigs'

export function AssociatesReportTab({ navigate }) {
  const { data, loading } = useReportData('associates')

  if (loading) return <LoadingState />

  const handleExport = () =>
    exportToExcel({
      filename: reportFilename('asociados', formatDate(new Date())),
      sheetName: 'Asociados',
      data: data || [],
      columns: EXPORT_COLUMNS.associates,
    })

  const byStatus = {}
  const byCategory = {}
  data?.forEach((a) => {
    const status = a.associate_status?.label || 'Sin estado'
    byStatus[status] = (byStatus[status] || 0) + 1
    const cat = a.category?.name || 'Sin categoría'
    byCategory[cat] = (byCategory[cat] || 0) + 1
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DistributionChart title="Por estado" data={byStatus} />
        <DistributionChart title="Por categoría" data={byCategory} />
      </div>
      <ReportSection
        title="Listado de asociados"
        count={data?.length}
        onExport={handleExport}
      >
        <ReportTable
          columns={REPORT_TABLE_COLUMNS.associates}
          data={data}
          onRowClick={(row) => navigate(`${ROUTES.ASOCIADOS}/${row.id}`)}
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
