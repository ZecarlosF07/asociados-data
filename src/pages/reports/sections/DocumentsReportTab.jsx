import { DistributionChart } from '../../../components/molecules/reports/DistributionChart'
import { ReportKpiCard } from '../../../components/molecules/reports/ReportKpiCard'
import { ReportSection } from '../../../components/molecules/reports/ReportSection'
import { ReportTable } from '../../../components/molecules/reports/ReportTable'
import { Loader } from '../../../components/atoms/Loader'
import { useReportData } from '../../../hooks/useReportData'
import { exportToExcel, EXPORT_COLUMNS } from '../../../utils/exportUtils'
import { formatDate } from '../../../utils/helpers'
import { REPORT_TABLE_COLUMNS, reportFilename } from '../../../utils/reportConfigs'

export function DocumentsReportTab() {
  const { data, loading } = useReportData('documents')

  if (loading) return <LoadingState />

  const handleExport = () =>
    exportToExcel({
      filename: reportFilename('documentos', formatDate(new Date())),
      sheetName: 'Documentos',
      data: data || [],
      columns: EXPORT_COLUMNS.documents,
    })

  const byType = {}
  const byCategory = {}
  data?.forEach((d) => {
    const type = d.document_type?.label || 'Sin tipo'
    byType[type] = (byType[type] || 0) + 1
    const cat = d.document_category?.label || 'Sin categoría'
    byCategory[cat] = (byCategory[cat] || 0) + 1
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ReportKpiCard icon="📁" title="Total documentos" value={data?.length || 0} />
        <ReportKpiCard
          icon="🏢"
          title="Con asociado"
          value={data?.filter((d) => d.associate).length || 0}
        />
        <ReportKpiCard icon="📎" title="Tipos distintos" value={Object.keys(byType).length} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DistributionChart title="Por tipo" data={byType} />
        <DistributionChart title="Por categoría" data={byCategory} />
      </div>
      <ReportSection title="Listado de documentos" count={data?.length} onExport={handleExport}>
        <ReportTable columns={REPORT_TABLE_COLUMNS.documents} data={data} />
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
