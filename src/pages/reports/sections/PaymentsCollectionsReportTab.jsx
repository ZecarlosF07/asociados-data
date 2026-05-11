import { DistributionChart } from '../../../components/molecules/reports/DistributionChart'
import { ReportKpiCard } from '../../../components/molecules/reports/ReportKpiCard'
import { ReportSection } from '../../../components/molecules/reports/ReportSection'
import { ReportTable } from '../../../components/molecules/reports/ReportTable'
import { Loader } from '../../../components/atoms/Loader'
import { useReportData } from '../../../hooks/useReportData'
import { exportToExcel, EXPORT_COLUMNS } from '../../../utils/exportUtils'
import { formatCurrency, formatDate } from '../../../utils/helpers'
import { REPORT_TABLE_COLUMNS, reportFilename } from '../../../utils/reportConfigs'

export function PaymentsCollectionsReportTab() {
  const { data: payments, loading: loadingP } = useReportData('payments')
  const { data: schedules, loading: loadingS } = useReportData('schedules')
  const { data: collections, loading: loadingC } = useReportData('collections')

  if (loadingP || loadingS || loadingC) return <LoadingState />

  const handleExportPayments = () =>
    exportToExcel({
      filename: reportFilename('pagos', formatDate(new Date())),
      sheetName: 'Pagos',
      data: payments || [],
      columns: EXPORT_COLUMNS.payments,
    })

  const handleExportSchedules = () =>
    exportToExcel({
      filename: reportFilename('cronograma', formatDate(new Date())),
      sheetName: 'Cronograma',
      data: schedules || [],
      columns: EXPORT_COLUMNS.schedules,
    })

  const handleExportCollections = () =>
    exportToExcel({
      filename: reportFilename('gestiones_cobranza', formatDate(new Date())),
      sheetName: 'Gestiones',
      data: collections || [],
      columns: EXPORT_COLUMNS.collections,
    })

  const totalPaid = payments?.reduce((s, p) => s + Number(p.amount_paid || 0), 0) || 0
  const pendingSchedules = schedules?.filter((s) => !s.is_paid) || []
  const totalPending = pendingSchedules.reduce((s, r) => s + Number(r.expected_amount || 0), 0)
  const overdueSchedules = pendingSchedules.filter((s) => new Date(s.due_date) < new Date())
  const totalOverdue = overdueSchedules.reduce((s, r) => s + Number(r.expected_amount || 0), 0)

  const byMethod = {}
  payments?.forEach((p) => {
    const method = p.payment_method?.label || 'Sin método'
    byMethod[method] = (byMethod[method] || 0) + 1
  })

  const byCollectionStatus = {}
  schedules?.forEach((s) => {
    const status = s.collection_status?.label || 'Sin estado'
    byCollectionStatus[status] = (byCollectionStatus[status] || 0) + 1
  })

  const byCollectionResult = {}
  collections?.forEach((action) => {
    const result = action.action_result?.label || 'Sin resultado'
    byCollectionResult[result] = (byCollectionResult[result] || 0) + 1
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportKpiCard
          icon="💵"
          title="Total recaudado"
          value={formatCurrency(totalPaid)}
          accent="text-emerald-700"
        />
        <ReportKpiCard icon="🧾" title="Pagos registrados" value={payments?.length || 0} />
        <ReportKpiCard
          icon="📊"
          title="Pendiente de cobro"
          value={formatCurrency(totalPending)}
        />
        <ReportKpiCard
          icon="⚠️"
          title="Monto vencido"
          value={formatCurrency(totalOverdue)}
          accent={totalOverdue > 0 ? 'text-red-600' : 'text-slate-900'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DistributionChart title="Pagos por método" data={byMethod} />
        <DistributionChart title="Cuotas por estado" data={byCollectionStatus} />
      </div>

      <DistributionChart title="Gestiones por resultado" data={byCollectionResult} />

      <ReportSection title="Pagos registrados" count={payments?.length} onExport={handleExportPayments}>
        <ReportTable columns={REPORT_TABLE_COLUMNS.payments} data={payments} />
      </ReportSection>

      <ReportSection title="Cronograma de cuotas" count={schedules?.length} onExport={handleExportSchedules}>
        <ReportTable columns={REPORT_TABLE_COLUMNS.schedules} data={schedules} />
      </ReportSection>

      <ReportSection
        title="Gestiones de cobranza"
        count={collections?.length}
        onExport={handleExportCollections}
      >
        <ReportTable columns={REPORT_TABLE_COLUMNS.collections} data={collections} />
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
