import { useState } from 'react'
import { DistributionChart } from '../../../components/molecules/reports/DistributionChart'
import { ReportFilters } from '../../../components/molecules/reports/ReportFilters'
import { ReportKpiCard } from '../../../components/molecules/reports/ReportKpiCard'
import { ReportSection } from '../../../components/molecules/reports/ReportSection'
import { ReportTable } from '../../../components/molecules/reports/ReportTable'
import { Loader } from '../../../components/atoms/Loader'
import { useReportData } from '../../../hooks/useReportData'
import { ROUTES } from '../../../router/routes'
import { exportToExcel, EXPORT_COLUMNS } from '../../../utils/exportUtils'
import { formatCurrency, formatDate } from '../../../utils/helpers'
import { REPORT_TABLE_COLUMNS, reportFilename } from '../../../utils/reportConfigs'
import {
  buildCategoryOptions,
  matchesSearch,
} from '../../../utils/reportFilterUtils'

export function MembershipsReportTab({ navigate }) {
  const [filters, setFilters] = useState({ search: '', category: '' })
  const { data, loading } = useReportData('memberships')

  if (loading) return <LoadingState />

  const categories = buildCategoryOptions(data)
  const filteredData = (data || []).filter(
    (row) =>
      matchesSearch(row, filters.search, [
        'associate.company_name',
        'associate.ruc',
        'associate.internal_code',
      ]) &&
      (!filters.category ||
        row.category?.code === filters.category ||
        row.category?.name === filters.category)
  )

  const handleExport = () =>
    exportToExcel({
      filename: reportFilename('membresias', formatDate(new Date())),
      sheetName: 'Membresías',
      data: filteredData,
      columns: EXPORT_COLUMNS.memberships,
    })

  const byStatus = {}
  const byType = {}
  filteredData.forEach((m) => {
    const status = m.membership_status?.label || 'Sin estado'
    byStatus[status] = (byStatus[status] || 0) + 1
    const type = m.membership_type?.label || 'Sin tipo'
    byType[type] = (byType[type] || 0) + 1
  })

  const totalFees = filteredData.reduce((s, m) => s + Number(m.fee_amount || 0), 0) || 0
  const activeFees =
    filteredData.filter((m) => m.is_current).reduce((s, m) => s + Number(m.fee_amount || 0), 0) || 0

  return (
    <div className="space-y-6">
      <ReportFilters
        search={filters.search}
        category={filters.category}
        categories={categories}
        onSearchChange={(search) => setFilters((prev) => ({ ...prev, search }))}
        onCategoryChange={(category) => setFilters((prev) => ({ ...prev, category }))}
        onClear={() => setFilters({ search: '', category: '' })}
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportKpiCard icon="📋" title="Total membresías" value={filteredData.length} />
        <ReportKpiCard
          icon="✅"
          title="Vigentes"
          value={filteredData.filter((m) => m.is_current).length}
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
        count={filteredData.length}
        onExport={handleExport}
      >
        <ReportTable
          columns={REPORT_TABLE_COLUMNS.memberships}
          data={filteredData}
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
