import { DistributionChart } from '../../../components/molecules/reports/DistributionChart'
import { ReportKpiCard } from '../../../components/molecules/reports/ReportKpiCard'
import { ReportSection } from '../../../components/molecules/reports/ReportSection'
import { ReportTable } from '../../../components/molecules/reports/ReportTable'
import { Loader } from '../../../components/atoms/Loader'
import { useReportData } from '../../../hooks/useReportData'
import { ROUTES } from '../../../router/routes'
import { exportToExcel, EXPORT_COLUMNS } from '../../../utils/exportUtils'
import { formatCurrency, formatDate } from '../../../utils/helpers'
import { REPORT_TABLE_COLUMNS, reportFilename } from '../../../utils/reportConfigs'

export function MembershipsReportTab({ navigate }) {
  const { data, loading } = useReportData('memberships')

  if (loading) return <LoadingState />

  const handleExport = () =>
    exportToExcel({
      filename: reportFilename('membresias', formatDate(new Date())),
      sheetName: 'Membresías',
      data: data || [],
      columns: EXPORT_COLUMNS.memberships,
    })

  const byStatus = {}
  const byType = {}
  data?.forEach((m) => {
    const status = m.membership_status?.label || 'Sin estado'
    byStatus[status] = (byStatus[status] || 0) + 1
    const type = m.membership_type?.label || 'Sin tipo'
    byType[type] = (byType[type] || 0) + 1
  })

  const totalFees = data?.reduce((s, m) => s + Number(m.fee_amount || 0), 0) || 0
  const activeFees =
    data?.filter((m) => m.is_current).reduce((s, m) => s + Number(m.fee_amount || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportKpiCard icon="📋" title="Total membresías" value={data?.length || 0} />
        <ReportKpiCard
          icon="✅"
          title="Vigentes"
          value={data?.filter((m) => m.is_current).length || 0}
          accent="text-emerald-700"
        />
        <ReportKpiCard
          icon="💵"
          title="Tarifa total vigentes"
          value={formatCurrency(activeFees)}
          accent="text-emerald-700"
        />
        <ReportKpiCard icon="💰" title="Tarifa total histórica" value={formatCurrency(totalFees)} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DistributionChart title="Por estado" data={byStatus} />
        <DistributionChart title="Por tipo" data={byType} />
      </div>
      <ReportSection
        title="Listado de membresías"
        count={data?.length}
        onExport={handleExport}
      >
        <ReportTable
          columns={REPORT_TABLE_COLUMNS.memberships}
          data={data}
          onRowClick={(row) => navigate(`${ROUTES.ASOCIADOS}/${row.associate?.id}`)}
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
