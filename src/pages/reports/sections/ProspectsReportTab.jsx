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
  buildYearOptions,
  filterByPeriod,
  groupByMonth,
  matchesSearch,
} from '../../../utils/reportFilterUtils'

export function ProspectsReportTab({ navigate }) {
  const [filters, setFilters] = useState({ search: '', year: '', month: '' })
  const { data, loading } = useReportData('prospects')

  if (loading) return <LoadingState />

  const years = buildYearOptions(data, 'created_at')
  const filteredData = (data || []).filter(
    (row) =>
      matchesSearch(row, filters.search, ['company_name', 'ruc']) &&
      filterByPeriod(row, 'created_at', filters)
  )

  const handleExport = () =>
    exportToExcel({
      filename: reportFilename('prospectos', formatDate(new Date())),
      sheetName: 'Prospectos',
      data: filteredData,
      columns: EXPORT_COLUMNS.prospects,
    })

  const byStatus = {}
  filteredData.forEach((p) => {
    const code = p.prospect_status?.label || 'Sin estado'
    byStatus[code] = (byStatus[code] || 0) + 1
  })
  const byCreatedMonth = groupByMonth(filteredData, 'created_at')

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DistributionChart title="Distribución por estado" data={byStatus} />
        <DistributionChart title="Creados por mes" data={byCreatedMonth} />
      </div>
      <ReportSection
        title="Listado de prospectos"
        count={filteredData.length}
        onExport={handleExport}
      >
        <ReportTable
          columns={REPORT_TABLE_COLUMNS.prospects}
          data={filteredData}
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
