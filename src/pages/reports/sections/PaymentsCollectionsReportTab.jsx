import { useState } from 'react'
import { ReportFilters } from '../../../components/molecules/reports/ReportFilters'
import { ReportKpiCard } from '../../../components/molecules/reports/ReportKpiCard'
import { ReportSection } from '../../../components/molecules/reports/ReportSection'
import { ReportTable } from '../../../components/molecules/reports/ReportTable'
import { Badge } from '../../../components/atoms/Badge'
import { Loader } from '../../../components/atoms/Loader'
import { useReportData } from '../../../hooks/useReportData'
import { exportToExcel, EXPORT_COLUMNS } from '../../../utils/exportUtils'
import { formatCurrency, formatDate } from '../../../utils/helpers'
import { reportFilename } from '../../../utils/reportConfigs'
import {
  compareDateOnly,
  getDateOnlyParts,
  isBeforeDateOnly,
  todayDateOnly,
} from '../../../utils/dateOnly'
import {
  buildYearOptions,
  currentPeriod,
  defaultPeriodFilters,
  filterByPeriod,
  matchesSearch,
} from '../../../utils/reportFilterUtils'

export function PaymentsCollectionsReportTab() {
  const [filters, setFilters] = useState(defaultPeriodFilters)
  const [activeList, setActiveList] = useState('overdue')
  const { data: payments, loading: loadingP } = useReportData('payments')
  const { data: schedules, loading: loadingS } = useReportData('schedules')
  const { data: collections, loading: loadingC } = useReportData('collections')

  if (loadingP || loadingS || loadingC) return <LoadingState />

  const years = [
    ...new Set([
      Number(filters.year || currentPeriod().year),
      ...buildYearOptions(payments, 'payment_date'),
      ...buildYearOptions(schedules, 'due_date'),
      ...buildYearOptions(collections, 'action_date'),
    ]),
  ].sort((a, b) => b - a)

  const associateSearchFields = [
    'associate.company_name',
    'associate.ruc',
    'associate.internal_code',
  ]

  const filteredPayments = (payments || [])
    .filter(
      (row) =>
        matchesSearch(row, filters.search, associateSearchFields) &&
        filterByPeriod(row, 'payment_date', filters)
    )
    .sort(sortPayments)

  const filteredSchedules = (schedules || [])
    .filter(
      (row) =>
        matchesSearch(row, filters.search, associateSearchFields) &&
        filterByPeriod(row, 'due_date', filters)
    )
    .sort(sortSchedules)

  const filteredCollections = (collections || [])
    .filter(
      (row) =>
        matchesSearch(row, filters.search, associateSearchFields) &&
        filterByPeriod(row, 'action_date', filters)
    )
    .sort(sortCollections)

  const handleExportPayments = () =>
    exportToExcel({
      filename: reportFilename('pagos', formatDate(new Date())),
      sheetName: 'Pagos',
      data: filteredPayments,
      columns: EXPORT_COLUMNS.payments,
    })

  const handleExportSchedules = (
    data = filteredSchedules,
    prefix = 'cronograma',
    sheetName = 'Cronograma'
  ) =>
    exportToExcel({
      filename: reportFilename(prefix, formatDate(new Date())),
      sheetName,
      data,
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
  const paidSchedules = filteredSchedules.filter((s) => s.is_paid)
  const upcomingSchedules = pendingSchedules.filter((s) =>
    !isBeforeDateOnly(s.due_date, today)
  )
  const totalUpcoming = upcomingSchedules.reduce((s, r) => s + Number(r.expected_amount || 0), 0)
  const totalPaidSchedules = paidSchedules.reduce((s, r) => s + Number(r.expected_amount || 0), 0)

  const listConfig = {
    overdue: {
      title: 'Cuotas vencidas por cobrar',
      subtitle: 'Lista principal de cobranza. Ordenada por mayor atraso y fecha de vencimiento.',
      count: overdueSchedules.length,
      amount: totalOverdue,
      export: () => handleExportSchedules(overdueSchedules, 'cuotas_vencidas', 'Vencidas'),
      columns: FINANCIAL_REPORT_COLUMNS.overdue,
      data: overdueSchedules,
    },
    upcoming: {
      title: 'Cuotas pendientes no vencidas',
      subtitle: 'Cuotas aún dentro de plazo, ordenadas por próximo vencimiento.',
      count: upcomingSchedules.length,
      amount: totalUpcoming,
      export: () => handleExportSchedules(upcomingSchedules, 'cuotas_por_vencer', 'Por vencer'),
      columns: FINANCIAL_REPORT_COLUMNS.upcoming,
      data: upcomingSchedules,
    },
    paidSchedules: {
      title: 'Cuotas pagadas con vencimiento en el período',
      subtitle: 'Cuotas ya canceladas filtradas por la fecha de vencimiento del cronograma.',
      count: paidSchedules.length,
      amount: totalPaidSchedules,
      export: () => handleExportSchedules(paidSchedules, 'cuotas_pagadas', 'Pagadas'),
      columns: FINANCIAL_REPORT_COLUMNS.paidSchedules,
      data: paidSchedules,
    },
    payments: {
      label: 'Pagos',
      title: 'Pagos registrados en el período',
      subtitle: 'Movimientos de pago filtrados por la fecha real de pago.',
      count: filteredPayments.length,
      amount: totalPaid,
      export: handleExportPayments,
      columns: FINANCIAL_REPORT_COLUMNS.payments,
      data: filteredPayments,
    },
    collections: {
      label: 'Gestiones',
      title: 'Historial de gestiones',
      subtitle: 'Registro operativo de llamadas, mensajes y acuerdos. No es la lista principal de cobranza.',
      count: filteredCollections.length,
      amount: null,
      export: handleExportCollections,
      columns: FINANCIAL_REPORT_COLUMNS.collections,
      data: filteredCollections,
    },
  }
  const selectedList = listConfig[activeList]

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
          title="Pendiente total"
          value={formatCurrency(totalPending)}
        />
        <ReportKpiCard
          icon="⚠️"
          title="Vencido"
          value={`${overdueSchedules.length} cuotas · ${formatCurrency(totalOverdue)}`}
          accent={totalOverdue > 0 ? 'text-red-600' : 'text-slate-900'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <FinancialListButton
          active={activeList === 'overdue'}
          title="Vencidas"
          description={`${overdueSchedules.length} cuotas por cobrar`}
          amount={formatCurrency(totalOverdue)}
          tone="danger"
          onClick={() => setActiveList('overdue')}
        />
        <FinancialListButton
          active={activeList === 'upcoming'}
          title="Por vencer"
          description={`${upcomingSchedules.length} cuotas en plazo`}
          amount={formatCurrency(totalUpcoming)}
          onClick={() => setActiveList('upcoming')}
        />
        <FinancialListButton
          active={activeList === 'paidSchedules'}
          title="Pagadas"
          description={`${paidSchedules.length} vencen en el período`}
          amount={formatCurrency(totalPaidSchedules)}
          tone="success"
          onClick={() => setActiveList('paidSchedules')}
        />
        <FinancialListButton
          active={activeList === 'payments'}
          title="Pagos registrados"
          description={`${filteredPayments.length} pagos en el período`}
          amount={formatCurrency(totalPaid)}
          onClick={() => setActiveList('payments')}
        />
        <FinancialListButton
          active={activeList === 'collections'}
          title="Gestiones"
          description={`${filteredCollections.length} acciones registradas`}
          amount="Historial"
          onClick={() => setActiveList('collections')}
        />
      </div>

      <ReportSection
        title={selectedList.title}
        subtitle={selectedList.subtitle}
        count={selectedList.count}
        onExport={selectedList.export}
      >
        <ReportTable columns={selectedList.columns} data={selectedList.data} />
      </ReportSection>
    </div>
  )
}

const FINANCIAL_REPORT_COLUMNS = {
  overdue: [
    { key: 'associate.internal_code', label: 'Código' },
    { key: 'associate.company_name', label: 'Asociado' },
    { key: 'associate.ruc', label: 'RUC' },
    {
      key: 'period_month',
      label: 'Período',
      render: (_, row) => formatPeriod(row),
    },
    { key: 'due_date', label: 'Vencimiento', format: 'date' },
    {
      key: 'overdue_days',
      label: 'Atraso',
      align: 'right',
      render: (_, row) => `${getOverdueDays(row.due_date)} días`,
    },
    { key: 'expected_amount', label: 'Monto', format: 'currency', align: 'right' },
    {
      key: 'collection_status.label',
      label: 'Seguimiento',
      render: (_, row) => renderCollectionStatus(row),
    },
  ],
  upcoming: [
    { key: 'associate.internal_code', label: 'Código' },
    { key: 'associate.company_name', label: 'Asociado' },
    { key: 'associate.ruc', label: 'RUC' },
    {
      key: 'period_month',
      label: 'Período',
      render: (_, row) => formatPeriod(row),
    },
    { key: 'due_date', label: 'Vencimiento', format: 'date' },
    { key: 'expected_amount', label: 'Monto', format: 'currency', align: 'right' },
    {
      key: 'collection_status.label',
      label: 'Seguimiento',
      render: (_, row) => renderCollectionStatus(row),
    },
  ],
  paidSchedules: [
    { key: 'associate.internal_code', label: 'Código' },
    { key: 'associate.company_name', label: 'Asociado' },
    { key: 'associate.ruc', label: 'RUC' },
    {
      key: 'period_month',
      label: 'Período',
      render: (_, row) => formatPeriod(row),
    },
    { key: 'due_date', label: 'Vencimiento', format: 'date' },
    { key: 'paid_at', label: 'Pagado el', format: 'date' },
    { key: 'expected_amount', label: 'Monto', format: 'currency', align: 'right' },
  ],
  payments: [
    { key: 'payment_date', label: 'Fecha de pago', format: 'date' },
    { key: 'associate.internal_code', label: 'Código' },
    { key: 'associate.company_name', label: 'Asociado' },
    { key: 'associate.ruc', label: 'RUC' },
    { key: 'payment_schedule_period', label: 'Cuota' },
    { key: 'amount_paid', label: 'Monto', format: 'currency', align: 'right' },
    { key: 'operation_code', label: 'Operación' },
  ],
  collections: [
    { key: 'action_date', label: 'Fecha', format: 'date' },
    { key: 'associate.internal_code', label: 'Código' },
    { key: 'associate.company_name', label: 'Asociado' },
    { key: 'associate.ruc', label: 'RUC' },
    {
      key: 'action_result.label',
      label: 'Resultado',
      format: 'badge',
      badgeVariant: (val) => {
        if (val === 'Contactado') return 'success'
        if (val === 'No contactado' || val === 'Rechazo') return 'danger'
        if (val === 'Compromiso de pago') return 'info'
        if (val === 'Sin respuesta') return 'warning'
        return 'default'
      },
    },
    { key: 'contact_type.label', label: 'Contacto' },
    { key: 'subject', label: 'Asunto' },
    { key: 'short_observation', label: 'Observación' },
    { key: 'managed_by.full_name', label: 'Responsable' },
  ],
}

function FinancialListButton({ active, title, description, amount, tone = 'default', onClick }) {
  const activeTone = {
    danger: 'border-red-700 bg-red-700',
    success: 'border-emerald-700 bg-emerald-700',
    default: 'border-slate-900 bg-slate-900',
  }[tone]

  return (
    <button
      type="button"
      className={`text-left border rounded-lg p-4 transition-colors ${
        active
          ? `${activeTone} text-white`
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
      }`}
      onClick={onClick}
    >
      <span className={`block text-xs font-semibold mb-1 ${active ? 'text-slate-300' : 'text-slate-400'}`}>
        {description}
      </span>
      <span className="block text-sm font-bold">{title}</span>
      <span className={`block text-lg font-bold mt-2 ${active ? 'text-white' : 'text-slate-900'}`}>
        {amount}
      </span>
    </button>
  )
}

function sortPayments(a, b) {
  return compareDateOnlyDesc(a.payment_date, b.payment_date) ||
    compareText(a.associate?.company_name, b.associate?.company_name)
}

function sortCollections(a, b) {
  return compareTimestampDesc(a.action_date, b.action_date) ||
    compareText(a.associate?.company_name, b.associate?.company_name)
}

function sortSchedules(a, b) {
  return getSchedulePriority(a) - getSchedulePriority(b) ||
    compareDateOnly(a.due_date, b.due_date) ||
    compareText(a.associate?.company_name, b.associate?.company_name)
}

function getSchedulePriority(row) {
  const code = row.schedule_status?.code
  if (code === 'VENCIDO') return 1
  if (code === 'POR_VENCER') return 2
  if (code === 'EN_GESTION' || code === 'PARCIAL') return 3
  if (code === 'PENDIENTE') return 4
  if (code === 'PAGADO') return 5
  if (code === 'ANULADO') return 6
  return 7
}

function formatPeriod(row) {
  if (row.period_month) {
    return `${String(row.period_month).padStart(2, '0')}/${row.period_year}`
  }
  return row.period_year || '—'
}

function renderCollectionStatus(row) {
  const code = row.collection_status?.code

  if (code === 'EN_GESTION') {
    return <Badge variant="info">Con gestión</Badge>
  }

  if (code === 'PARCIAL') {
    return <Badge variant="warning">Pago parcial</Badge>
  }

  if (code === 'PAGADO' || row.is_paid) {
    return <Badge variant="success">Pagado</Badge>
  }

  if (code === 'ANULADO') {
    return <Badge variant="default">Anulado</Badge>
  }

  return <Badge variant="default">Sin gestión</Badge>
}

function getOverdueDays(dueDate) {
  const due = getDateOnlyParts(dueDate)
  const current = getDateOnlyParts(todayDateOnly())
  const dueTime = new Date(due.year, due.month - 1, due.day).getTime()
  const currentTime = new Date(current.year, current.month - 1, current.day).getTime()
  return Math.max(0, Math.floor((currentTime - dueTime) / 86400000))
}

function compareDateOnlyDesc(a, b) {
  return compareDateOnly(b, a)
}

function compareTimestampDesc(a, b) {
  return new Date(b || 0).getTime() - new Date(a || 0).getTime()
}

function compareText(a = '', b = '') {
  return String(a).localeCompare(String(b), 'es')
}

function LoadingState() {
  return (
    <div className="flex justify-center py-16">
      <Loader />
    </div>
  )
}
