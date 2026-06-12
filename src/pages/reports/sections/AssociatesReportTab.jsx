import { useState } from 'react'
import { DistributionChart } from '../../../components/molecules/reports/DistributionChart'
import { ReportFilters } from '../../../components/molecules/reports/ReportFilters'
import { ReportSection } from '../../../components/molecules/reports/ReportSection'
import { ReportTable } from '../../../components/molecules/reports/ReportTable'
import { Loader } from '../../../components/atoms/Loader'
import { useReportData } from '../../../hooks/useReportData'
import { ROUTES } from '../../../router/routes'
import { exportToExcel, EXPORT_COLUMNS } from '../../../utils/exportUtils'
import { formatDate } from '../../../utils/helpers'
import { REPORT_TABLE_COLUMNS, reportFilename } from '../../../utils/reportConfigs'
import {
  buildPeriodYearOptions,
  defaultPeriodFilters,
  filterByPeriod,
  groupByMonth,
  matchesSearch,
} from '../../../utils/reportFilterUtils'

export function AssociatesReportTab({ navigate }) {
  const [filters, setFilters] = useState(defaultPeriodFilters)
  const { data, error, loading } = useReportData('associates')

  if (loading) return <LoadingState />
  if (error) return <ReportErrorState error={error} />

  const rows = Array.isArray(data) ? data : []
  const years = buildPeriodYearOptions(rows, 'association_date', filters.year)
  const filteredData = rows.filter(
    (row) =>
      matchesSearch(row, filters.search, ['company_name', 'ruc', 'internal_code']) &&
      filterByPeriod(row, 'association_date', filters)
  )

  const handleExport = () =>
    exportToExcel({
      filename: reportFilename('asociados', formatDate(new Date())),
      sheetName: 'Asociados',
      data: filteredData,
      columns: EXPORT_COLUMNS.associates,
    })

  const byStatus = {}
  const byCategory = {}
  filteredData.forEach((a) => {
    const status = a.associate_status?.label || 'Sin estado'
    byStatus[status] = (byStatus[status] || 0) + 1
    const cat = a.category?.name || 'Sin categoría'
    byCategory[cat] = (byCategory[cat] || 0) + 1
  })
  const byAssociationMonth = groupByMonth(filteredData, 'association_date')

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
        onClear={() => setFilters(defaultPeriodFilters())}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DistributionChart title="Por estado" data={byStatus} />
        <DistributionChart title="Por categoría" data={byCategory} />
      </div>
      <DistributionChart title="Asociados por mes" data={byAssociationMonth} />
      <ReportSection
        title="Listado de asociados"
        count={filteredData.length}
        onExport={handleExport}
      >
        <ReportTable
          columns={REPORT_TABLE_COLUMNS.associates}
          data={filteredData}
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

function ReportErrorState({ error }) {
  return (
    <div className="rounded-lg border border-red-100 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-700">
        No se pudo cargar el reporte de asociados.
      </p>
      <p className="mt-1 text-xs text-red-600">
        {error}
      </p>
    </div>
  )
}
