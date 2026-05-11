import { DistributionChart } from '../../../components/molecules/reports/DistributionChart'
import { ReportKpiCard } from '../../../components/molecules/reports/ReportKpiCard'
import { Loader } from '../../../components/atoms/Loader'
import { useReportData } from '../../../hooks/useReportData'
import { ROUTES } from '../../../router/routes'
import { formatCurrency } from '../../../utils/helpers'
import {
  STATUS_COLORS_ASSOCIATES,
  STATUS_COLORS_PROSPECTS,
} from '../../../utils/reportConfigs'

export function ReportsSummaryTab({ navigate }) {
  const { data: kpis, loading } = useReportData('kpis')

  if (loading) return <LoadingState />
  if (!kpis) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ReportKpiCard
          icon="🎯"
          title="Prospectos"
          value={kpis.prospects.total}
          subtitle={`${kpis.prospects.byStatus.APROBADO || 0} aprobados`}
          onClick={() => navigate(ROUTES.PROSPECTOS)}
        />
        <ReportKpiCard
          icon="🏢"
          title="Asociados"
          value={kpis.associates.total}
          subtitle={`${kpis.associates.byStatus.ACTIVO || 0} activos`}
          onClick={() => navigate(ROUTES.ASOCIADOS)}
        />
        <ReportKpiCard
          icon="📋"
          title="Membresías vigentes"
          value={kpis.memberships}
          subtitle="Actualmente activas"
          onClick={() => navigate(ROUTES.MEMBRESIAS)}
        />
        <ReportKpiCard
          icon="📁"
          title="Documentos"
          value={kpis.documents}
          subtitle="En el repositorio"
          onClick={() => navigate(ROUTES.DOCUMENTOS)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ReportKpiCard
          icon="💰"
          title="Recaudado este mes"
          value={formatCurrency(kpis.financial.collectedThisMonth)}
          subtitle="Pagos registrados"
          accent="text-emerald-700"
        />
        <ReportKpiCard
          icon="📊"
          title="Pendiente de cobro"
          value={formatCurrency(kpis.financial.pending)}
          subtitle={`${kpis.financial.pendingCount} cuotas`}
          onClick={() => navigate(ROUTES.COBRANZA)}
        />
        <ReportKpiCard
          icon="⚠️"
          title="Monto vencido"
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

function LoadingState() {
  return (
    <div className="flex justify-center py-16">
      <Loader />
    </div>
  )
}
