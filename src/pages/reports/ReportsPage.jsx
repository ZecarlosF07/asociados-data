import { useState } from 'react'
import { useReportData } from '../../hooks/useReportData'
import { reportsService } from '../../services/reports.service'
import { useNavigate } from 'react-router-dom'
import { exportToExcel, exportMultiSheetExcel, EXPORT_COLUMNS } from '../../utils/exportUtils'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { ReportKpiCard } from '../../components/molecules/reports/ReportKpiCard'
import { DistributionChart } from '../../components/molecules/reports/DistributionChart'
import { ReportSection } from '../../components/molecules/reports/ReportSection'
import { ReportTable } from '../../components/molecules/reports/ReportTable'
import { Button } from '../../components/atoms/Button'
import { Loader } from '../../components/atoms/Loader'
import { ROUTES } from '../../router/routes'

const TABS = [
  { key: 'overview', label: 'Resumen' },
  { key: 'prospects', label: 'Prospectos' },
  { key: 'associates', label: 'Asociados' },
  { key: 'memberships', label: 'Membresías' },
  { key: 'financial', label: 'Pagos y cobranza' },
  { key: 'documents', label: 'Documentos' },
]

export function ReportsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Reportes</h1>
          <p className="text-sm text-slate-400">
            Consulta, análisis y exportación de información del sistema ·{' '}
            {formatDate(new Date())}
          </p>
        </div>
        <ExportAllButton />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab navigate={navigate} />}
      {activeTab === 'prospects' && <ProspectsTab navigate={navigate} />}
      {activeTab === 'associates' && <AssociatesTab navigate={navigate} />}
      {activeTab === 'memberships' && <MembershipsTab navigate={navigate} />}
      {activeTab === 'financial' && <FinancialTab />}
      {activeTab === 'documents' && <DocumentsTab />}
    </div>
  )
}

// ────────────────────────────────────────
//  Resumen / Overview
// ────────────────────────────────────────
function OverviewTab({ navigate }) {
  const { data: kpis, loading } = useReportData('kpis')

  if (loading) return <div className="flex justify-center py-16"><Loader /></div>
  if (!kpis) return null

  const STATUS_COLORS_PROSPECTS = {
    NUEVO: 'bg-blue-500',
    EN_EVALUACION: 'bg-amber-500',
    COTIZADO: 'bg-cyan-500',
    EN_SEGUIMIENTO: 'bg-purple-500',
    APROBADO: 'bg-emerald-500',
    CONVERTIDO: 'bg-green-700',
    DESCARTADO: 'bg-red-500',
  }

  const STATUS_COLORS_ASSOCIATES = {
    ACTIVO: 'bg-emerald-500',
    INACTIVO: 'bg-slate-400',
    SUSPENDIDO: 'bg-red-500',
    EN_PROCESO: 'bg-amber-500',
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportKpiCard
          icon="🎯" title="Prospectos" value={kpis.prospects.total}
          subtitle={`${kpis.prospects.byStatus.APROBADO || 0} aprobados`}
          onClick={() => navigate(ROUTES.PROSPECTOS)}
        />
        <ReportKpiCard
          icon="🏢" title="Asociados" value={kpis.associates.total}
          subtitle={`${kpis.associates.byStatus.ACTIVO || 0} activos`}
          onClick={() => navigate(ROUTES.ASOCIADOS)}
        />
        <ReportKpiCard
          icon="📋" title="Membresías vigentes" value={kpis.memberships}
          subtitle="Actualmente activas"
          onClick={() => navigate(ROUTES.MEMBRESIAS)}
        />
        <ReportKpiCard
          icon="📁" title="Documentos" value={kpis.documents}
          subtitle="En el repositorio"
          onClick={() => navigate(ROUTES.DOCUMENTOS)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReportKpiCard
          icon="💰" title="Recaudado este mes"
          value={formatCurrency(kpis.financial.collectedThisMonth)}
          subtitle="Pagos registrados"
          accent="text-emerald-700"
        />
        <ReportKpiCard
          icon="📊" title="Pendiente de cobro"
          value={formatCurrency(kpis.financial.pending)}
          subtitle={`${kpis.financial.pendingCount} cuotas`}
          onClick={() => navigate(ROUTES.COBRANZA)}
        />
        <ReportKpiCard
          icon="⚠️" title="Monto vencido"
          value={formatCurrency(kpis.financial.overdue)}
          subtitle={`${kpis.financial.overdueCount} cuotas`}
          accent={kpis.financial.overdueCount > 0 ? 'text-red-600' : 'text-slate-900'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DistributionChart
          title="Prospectos por estado"
          data={kpis.prospects.byStatus}
          colorMap={STATUS_COLORS_PROSPECTS}
        />
        <DistributionChart
          title="Asociados por estado"
          data={kpis.associates.byStatus}
          colorMap={STATUS_COLORS_ASSOCIATES}
        />
      </div>
    </div>
  )
}

// ────────────────────────────────────────
//  Prospectos
// ────────────────────────────────────────
function ProspectsTab({ navigate }) {
  const { data, loading } = useReportData('prospects')

  if (loading) return <div className="flex justify-center py-16"><Loader /></div>

  const handleExport = () => {
    exportToExcel({
      filename: `prospectos_${formatDate(new Date()).replace(/\//g, '-')}`,
      sheetName: 'Prospectos',
      data: data || [],
      columns: EXPORT_COLUMNS.prospects,
    })
  }

  // Distribución por estado
  const byStatus = {}
  data?.forEach((p) => {
    const code = p.prospect_status?.label || 'Sin estado'
    byStatus[code] = (byStatus[code] || 0) + 1
  })

  const TABLE_COLUMNS = [
    { key: 'company_name', label: 'Razón social' },
    { key: 'ruc', label: 'RUC' },
    { key: 'prospect_status.label', label: 'Estado', format: 'badge',
      badgeVariant: (val) => {
        if (val === 'Aprobado') return 'success'
        if (val === 'Descartado') return 'danger'
        if (val === 'En evaluación') return 'warning'
        return 'default'
      }
    },
    { key: 'category.name', label: 'Categoría' },
    { key: 'captador.full_name', label: 'Captador' },
    { key: 'created_at', label: 'Registro', format: 'date' },
  ]

  return (
    <div className="space-y-6">
      <DistributionChart title="Distribución por estado" data={byStatus} />
      <ReportSection
        title="Listado de prospectos"
        count={data?.length}
        onExport={handleExport}
      >
        <ReportTable
          columns={TABLE_COLUMNS}
          data={data}
          onRowClick={(row) => navigate(`${ROUTES.PROSPECTOS}/${row.id}`)}
        />
      </ReportSection>
    </div>
  )
}

// ────────────────────────────────────────
//  Asociados
// ────────────────────────────────────────
function AssociatesTab({ navigate }) {
  const { data, loading } = useReportData('associates')

  if (loading) return <div className="flex justify-center py-16"><Loader /></div>

  const handleExport = () => {
    exportToExcel({
      filename: `asociados_${formatDate(new Date()).replace(/\//g, '-')}`,
      sheetName: 'Asociados',
      data: data || [],
      columns: EXPORT_COLUMNS.associates,
    })
  }

  const byStatus = {}
  const byCategory = {}
  data?.forEach((a) => {
    const status = a.associate_status?.label || 'Sin estado'
    byStatus[status] = (byStatus[status] || 0) + 1
    const cat = a.category?.name || 'Sin categoría'
    byCategory[cat] = (byCategory[cat] || 0) + 1
  })

  const TABLE_COLUMNS = [
    { key: 'internal_code', label: 'Código' },
    { key: 'company_name', label: 'Razón social' },
    { key: 'ruc', label: 'RUC' },
    { key: 'associate_status.label', label: 'Estado', format: 'badge',
      badgeVariant: (val) => {
        if (val === 'Activo') return 'success'
        if (val === 'Suspendido') return 'danger'
        if (val === 'Inactivo') return 'warning'
        return 'default'
      }
    },
    { key: 'category.name', label: 'Categoría' },
    { key: 'association_date', label: 'Asociación', format: 'date' },
    { key: 'payment_health.label', label: 'Salud de pago', format: 'badge',
      badgeVariant: (val) => {
        if (val === 'Al día') return 'success'
        if (val === 'Moroso') return 'danger'
        if (val === 'Crítico') return 'danger'
        if (val === 'Por vencer') return 'warning'
        return 'default'
      }
    },
  ]

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
          columns={TABLE_COLUMNS}
          data={data}
          onRowClick={(row) => navigate(`${ROUTES.ASOCIADOS}/${row.id}`)}
        />
      </ReportSection>
    </div>
  )
}

// ────────────────────────────────────────
//  Membresías
// ────────────────────────────────────────
function MembershipsTab({ navigate }) {
  const { data, loading } = useReportData('memberships')

  if (loading) return <div className="flex justify-center py-16"><Loader /></div>

  const handleExport = () => {
    exportToExcel({
      filename: `membresias_${formatDate(new Date()).replace(/\//g, '-')}`,
      sheetName: 'Membresías',
      data: data || [],
      columns: EXPORT_COLUMNS.memberships,
    })
  }

  const byStatus = {}
  const byType = {}
  data?.forEach((m) => {
    const status = m.membership_status?.label || 'Sin estado'
    byStatus[status] = (byStatus[status] || 0) + 1
    const type = m.membership_type?.label || 'Sin tipo'
    byType[type] = (byType[type] || 0) + 1
  })

  const totalFees = data?.reduce((s, m) => s + Number(m.fee_amount || 0), 0) || 0
  const activeFees = data?.filter((m) => m.is_current).reduce((s, m) => s + Number(m.fee_amount || 0), 0) || 0

  const TABLE_COLUMNS = [
    { key: 'associate.internal_code', label: 'Código' },
    { key: 'associate.company_name', label: 'Asociado' },
    { key: 'membership_type.label', label: 'Tipo' },
    { key: 'category.name', label: 'Categoría' },
    { key: 'fee_amount', label: 'Tarifa', format: 'currency', align: 'right' },
    { key: 'start_date', label: 'Inicio', format: 'date' },
    { key: 'membership_status.label', label: 'Estado', format: 'badge',
      badgeVariant: (val) => {
        if (val === 'Vigente') return 'success'
        if (val === 'Vencida' || val === 'Cancelada') return 'danger'
        if (val === 'Renovada') return 'info'
        return 'default'
      }
    },
    { key: 'is_current', label: 'Vigente', format: 'boolean', align: 'center' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportKpiCard icon="📋" title="Total membresías" value={data?.length || 0} />
        <ReportKpiCard icon="✅" title="Vigentes" value={data?.filter((m) => m.is_current).length || 0} accent="text-emerald-700" />
        <ReportKpiCard icon="💵" title="Tarifa total vigentes" value={formatCurrency(activeFees)} accent="text-emerald-700" />
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
          columns={TABLE_COLUMNS}
          data={data}
          onRowClick={(row) => navigate(`${ROUTES.ASOCIADOS}/${row.associate?.id}`)}
        />
      </ReportSection>
    </div>
  )
}

// ────────────────────────────────────────
//  Pagos y cobranza
// ────────────────────────────────────────
function FinancialTab() {
  const { data: payments, loading: loadingP } = useReportData('payments')
  const { data: schedules, loading: loadingS } = useReportData('schedules')

  if (loadingP || loadingS) return <div className="flex justify-center py-16"><Loader /></div>

  const handleExportPayments = () => {
    exportToExcel({
      filename: `pagos_${formatDate(new Date()).replace(/\//g, '-')}`,
      sheetName: 'Pagos',
      data: payments || [],
      columns: EXPORT_COLUMNS.payments,
    })
  }

  const handleExportSchedules = () => {
    exportToExcel({
      filename: `cronograma_${formatDate(new Date()).replace(/\//g, '-')}`,
      sheetName: 'Cronograma',
      data: schedules || [],
      columns: EXPORT_COLUMNS.schedules,
    })
  }

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

  const PAYMENT_COLUMNS = [
    { key: 'associate.internal_code', label: 'Código' },
    { key: 'associate.company_name', label: 'Asociado' },
    { key: 'payment_date', label: 'Fecha', format: 'date' },
    { key: 'amount_paid', label: 'Monto', format: 'currency', align: 'right' },
    { key: 'operation_code', label: 'Operación' },
    { key: 'payment_method.label', label: 'Método' },
  ]

  const SCHEDULE_COLUMNS = [
    { key: 'associate.internal_code', label: 'Código' },
    { key: 'associate.company_name', label: 'Asociado' },
    { key: 'due_date', label: 'Vencimiento', format: 'date' },
    { key: 'expected_amount', label: 'Monto', format: 'currency', align: 'right' },
    { key: 'is_paid', label: 'Pagado', format: 'boolean', align: 'center' },
    { key: 'collection_status.label', label: 'Estado', format: 'badge',
      badgeVariant: (val) => {
        if (val === 'Pagado') return 'success'
        if (val === 'Vencido') return 'danger'
        if (val === 'Pendiente') return 'warning'
        return 'default'
      }
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportKpiCard icon="💵" title="Total recaudado" value={formatCurrency(totalPaid)} accent="text-emerald-700" />
        <ReportKpiCard icon="🧾" title="Pagos registrados" value={payments?.length || 0} />
        <ReportKpiCard icon="📊" title="Pendiente de cobro" value={formatCurrency(totalPending)} />
        <ReportKpiCard icon="⚠️" title="Monto vencido" value={formatCurrency(totalOverdue)} accent={totalOverdue > 0 ? 'text-red-600' : 'text-slate-900'} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DistributionChart title="Pagos por método" data={byMethod} />
        <DistributionChart title="Cuotas por estado" data={byCollectionStatus} />
      </div>

      <ReportSection title="Pagos registrados" count={payments?.length} onExport={handleExportPayments}>
        <ReportTable columns={PAYMENT_COLUMNS} data={payments} />
      </ReportSection>

      <ReportSection title="Cronograma de cuotas" count={schedules?.length} onExport={handleExportSchedules}>
        <ReportTable columns={SCHEDULE_COLUMNS} data={schedules} />
      </ReportSection>
    </div>
  )
}

// ────────────────────────────────────────
//  Documentos
// ────────────────────────────────────────
function DocumentsTab() {
  const { data, loading } = useReportData('documents')

  if (loading) return <div className="flex justify-center py-16"><Loader /></div>

  const handleExport = () => {
    exportToExcel({
      filename: `documentos_${formatDate(new Date()).replace(/\//g, '-')}`,
      sheetName: 'Documentos',
      data: data || [],
      columns: EXPORT_COLUMNS.documents,
    })
  }

  const byType = {}
  const byCategory = {}
  data?.forEach((d) => {
    const type = d.document_type?.label || 'Sin tipo'
    byType[type] = (byType[type] || 0) + 1
    const cat = d.document_category?.label || 'Sin categoría'
    byCategory[cat] = (byCategory[cat] || 0) + 1
  })

  const TABLE_COLUMNS = [
    { key: 'title', label: 'Título' },
    { key: 'document_type.label', label: 'Tipo' },
    { key: 'document_category.label', label: 'Categoría' },
    { key: 'associate.company_name', label: 'Asociado' },
    { key: 'file_extension', label: 'Ext.' },
    { key: 'uploaded_at', label: 'Carga', format: 'date' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <ReportKpiCard icon="📁" title="Total documentos" value={data?.length || 0} />
        <ReportKpiCard icon="🏢" title="Con asociado" value={data?.filter((d) => d.associate).length || 0} />
        <ReportKpiCard icon="📎" title="Tipos distintos" value={Object.keys(byType).length} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DistributionChart title="Por tipo" data={byType} />
        <DistributionChart title="Por categoría" data={byCategory} />
      </div>
      <ReportSection title="Listado de documentos" count={data?.length} onExport={handleExport}>
        <ReportTable columns={TABLE_COLUMNS} data={data} />
      </ReportSection>
    </div>
  )
}

// ────────────────────────────────────────
//  Botón exportar todo
// ────────────────────────────────────────
function ExportAllButton() {
  const [loading, setLoading] = useState(false)

  const handleExportAll = async () => {
    setLoading(true)
    try {
      const [prospects, associates, memberships, payments, schedules, documents] = await Promise.all([
        reportsService.getProspectsSummary(),
        reportsService.getAssociatesSummary(),
        reportsService.getMembershipsSummary(),
        reportsService.getPaymentsSummary(),
        reportsService.getSchedulesSummary(),
        reportsService.getDocumentsSummary(),
      ])

      exportMultiSheetExcel({
        filename: `reporte_completo_${formatDate(new Date()).replace(/\//g, '-')}`,
        sheets: [
          { sheetName: 'Prospectos', data: prospects, columns: EXPORT_COLUMNS.prospects },
          { sheetName: 'Asociados', data: associates, columns: EXPORT_COLUMNS.associates },
          { sheetName: 'Membresías', data: memberships, columns: EXPORT_COLUMNS.memberships },
          { sheetName: 'Pagos', data: payments, columns: EXPORT_COLUMNS.payments },
          { sheetName: 'Cronograma', data: schedules, columns: EXPORT_COLUMNS.schedules },
          { sheetName: 'Documentos', data: documents, columns: EXPORT_COLUMNS.documents },
        ],
      })
    } catch (err) {
      console.error('Error al exportar:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="secondary" size="sm" onClick={handleExportAll} loading={loading}>
      📥 Exportar todo
    </Button>
  )
}
