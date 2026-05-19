import { useState } from 'react'
import { DistributionChart } from '../../../components/molecules/reports/DistributionChart'
import { ReportFilters } from '../../../components/molecules/reports/ReportFilters'
import { ReportKpiCard } from '../../../components/molecules/reports/ReportKpiCard'
import { ReportSection } from '../../../components/molecules/reports/ReportSection'
import { ReportTable } from '../../../components/molecules/reports/ReportTable'
import { Loader } from '../../../components/atoms/Loader'
import { useReportData } from '../../../hooks/useReportData'
import { exportToExcel, EXPORT_COLUMNS } from '../../../utils/exportUtils'
import { formatCurrency, formatDate } from '../../../utils/helpers'
import { REPORT_TABLE_COLUMNS, reportFilename } from '../../../utils/reportConfigs'
import { isBeforeDateOnly, todayDateOnly } from '../../../utils/dateOnly'
import {
  buildYearOptions,
  filterByPeriod,
  matchesSearch,
} from '../../../utils/reportFilterUtils'

export function PaymentsCollectionsReportTab() {
  const [filters, setFilters] = useState({ search: '', year: '', month: '' })
  const { data: payments, loading: loadingP } = useReportData('payments')
  const { data: schedules, loading: loadingS } = useReportData('schedules')
  const { data: collections, loading: loadingC } = useReportData('collections')

  if (loadingP || loadingS || loadingC) return <LoadingState />

  const years = [
    ...new Set([
      ...buildYearOptions(payments, 'payment_date'),
      ...buildYearOptions(schedules, 'due_date'),
      ...buildYearOptions(collections, 'action_date'),
    ]),
  ].sort((a, b) => b - a)

  const filteredPayments = (payments || []).filter(
    (row) =>
      matchesSearch(row, filters.search, [
        'associate.company_name',
        'associate.ruc',
        'associate.internal_code',
      ]) &&
      filterByPeriod(row, 'payment_date', filters)
  )

  const filteredSchedules = (schedules || []).filter(
    (row) =>
      matchesSearch(row, filters.search, [
        'associate.company_name',
        'associate.ruc',
        'associate.internal_code',
      ]) &&
      filterByPeriod(row, 'due_date', filters)
  )

  const filteredCollections = (collections || []).filter(
    (row) =>
      matchesSearch(row, filters.search, [
        'associate.company_name',
        'associate.ruc',
        'associate.internal_code',
      ]) &&
      filterByPeriod(row, 'action_date', filters)
  )

  const handleExportPayments = () =>
    exportToExcel({
      filename: reportFilename('pagos', formatDate(new Date())),
      sheetName: 'Pagos',
      data: filteredPayments,
      columns: EXPORT_COLUMNS.payments,
    })

  const handleExportSchedules = () =>
    exportToExcel({
      filename: reportFilename('cronograma', formatDate(new Date())),
      sheetName: 'Cronograma',
      data: filteredSchedules,
      columns: EXPORT_COLUMNS.schedules,
    })

  const handleExportCollections = () =>
    exportToExcel({
      filename: reportFilename('gestiones_cobranza', formatDate(new Date())),
      sheetName: 'Gestiones',
      data: filteredCollections,
      columns: EXPORT_COLUMNS.collections,
    })

  const totalPaid = filteredPayments.reduce((s, p) => s + Number(p.amount_paid || 0), 0) || 0
  const pendingSchedules = filteredSchedules.filter((s) => !s.is_paid)
  const totalPending = pendingSchedules.reduce((s, r) => s + Number(r.expected_amount || 0), 0)
  const today = todayDateOnly()
  const overdueSchedules = pendingSchedules.filter((s) =>
    isBeforeDateOnly(s.due_date, today)
  )
  const totalOverdue = overdueSchedules.reduce((s, r) => s + Number(r.expected_amount || 0), 0)

  const byMethod = {}
  filteredPayments.forEach((p) => {
    const method = p.payment_method?.label || 'Sin método'
    byMethod[method] = (byMethod[method] || 0) + 1
  })

  const byCollectionStatus = {}
  filteredSchedules.forEach((s) => {
    const status = s.collection_status?.label || 'Sin estado'
    byCollectionStatus[status] = (byCollectionStatus[status] || 0) + 1
  })

  const byCollectionResult = {}
  filteredCollections.forEach((action) => {
    const result = action.action_result?.label || 'Sin resultado'
    byCollectionResult[result] = (byCollectionResult[result] || 0) + 1
  })

  return (
    <div className="space-y-6">
      <ReportFilters
        search={filters.search}
        year={filters.year}
        month={filters.month}
        years={years}
        onSearchChange={(search) => setFilters((prev) => ({ ...prev, search }))}
        onYearChange={(year) => setFilters((prev) => ({ ...prev, year }))}
        onMonthChange={(month) => setFilters((prev) => ({ ...prev, month }))}
        onClear={() => setFilters({ search: '', year: '', month: '' })}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportKpiCard
          icon="💵"
          title="Total recaudado"
          value={formatCurrency(totalPaid)}
          accent="text-emerald-700"
        />
        <ReportKpiCard icon="🧾" title="Pagos registrados" value={filteredPayments.length} />
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

      <ReportSection title="Pagos registrados" count={filteredPayments.length} onExport={handleExportPayments}>
        <ReportTable columns={REPORT_TABLE_COLUMNS.payments} data={filteredPayments} />
      </ReportSection>

      <ReportSection title="Cronograma de cuotas" count={filteredSchedules.length} onExport={handleExportSchedules}>
        <ReportTable columns={REPORT_TABLE_COLUMNS.schedules} data={filteredSchedules} />
      </ReportSection>

      <ReportSection
        title="Gestiones de cobranza"
        count={filteredCollections.length}
        onExport={handleExportCollections}
      >
        <ReportTable columns={REPORT_TABLE_COLUMNS.collections} data={filteredCollections} />
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
