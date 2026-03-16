import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { Loader } from '../../components/atoms/Loader'
import { Badge } from '../../components/atoms/Badge'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { ROUTES } from '../../router/routes'

export function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboard()
  }, [])

  async function fetchDashboard() {
    setLoading(true)
    try {
      const now = new Date()
      const todayStr = now.toISOString().split('T')[0]

      const [
        prospectsRes,
        prospectsApprovedRes,
        associatesRes,
        associatesActiveRes,
        membershipsRes,
        pendingSchedulesRes,
        overdueSchedulesRes,
        paymentsThisMonthRes,
        recentProspectsRes,
        upcomingSchedulesRes,
      ] = await Promise.all([
        // Totales
        supabase.from('prospects').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
        supabase.from('prospects').select('id, prospect_status:prospect_status_id(code)', { count: 'exact' }).eq('is_deleted', false),
        supabase.from('associates').select('*', { count: 'exact', head: true }).eq('is_deleted', false),
        supabase.from('associates').select('id, associate_status:associate_status_id(code)', { count: 'exact' }).eq('is_deleted', false),
        supabase.from('memberships').select('*', { count: 'exact', head: true }).eq('is_deleted', false).eq('is_current', true),
        // Cobranza
        supabase.from('payment_schedules').select('expected_amount').eq('is_deleted', false).eq('is_paid', false),
        supabase.from('payment_schedules').select('expected_amount').eq('is_deleted', false).eq('is_paid', false).lt('due_date', todayStr),
        // Pagos del mes
        supabase.from('payments').select('amount_paid').eq('is_deleted', false).eq('is_reversed', false)
          .gte('payment_date', `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`),
        // Últimos prospectos
        supabase.from('prospects')
          .select('id, company_name, prospect_status:prospect_status_id(code, label), created_at')
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(5),
        // Próximas cuotas
        supabase.from('payment_schedules')
          .select('id, due_date, expected_amount, associate:associate_id(id, company_name, internal_code), collection_status:collection_status_id(code, label)')
          .eq('is_deleted', false)
          .eq('is_paid', false)
          .gte('due_date', todayStr)
          .order('due_date', { ascending: true })
          .limit(6),
      ])

      // Contar aprobados
      const approvedCount = prospectsApprovedRes.data?.filter(
        (p) => p.prospect_status?.code === 'APROBADO'
      ).length || 0

      // Contar activos
      const activeCount = associatesActiveRes.data?.filter(
        (a) => a.associate_status?.code === 'ACTIVO'
      ).length || 0

      // Sumar pendientes
      const totalPending = pendingSchedulesRes.data?.reduce(
        (s, r) => s + Number(r.expected_amount || 0), 0
      ) || 0

      // Sumar vencido
      const totalOverdue = overdueSchedulesRes.data?.reduce(
        (s, r) => s + Number(r.expected_amount || 0), 0
      ) || 0

      // Recaudado del mes
      const totalCollected = paymentsThisMonthRes.data?.reduce(
        (s, r) => s + Number(r.amount_paid || 0), 0
      ) || 0

      setStats({
        prospects: {
          total: prospectsRes.count || 0,
          approved: approvedCount,
        },
        associates: {
          total: associatesRes.count || 0,
          active: activeCount,
        },
        memberships: membershipsRes.count || 0,
        financial: {
          pending: totalPending,
          pendingCount: pendingSchedulesRes.data?.length || 0,
          overdue: totalOverdue,
          overdueCount: overdueSchedulesRes.data?.length || 0,
          collectedThisMonth: totalCollected,
        },
        recentProspects: recentProspectsRes.data || [],
        upcomingSchedules: upcomingSchedulesRes.data || [],
      })
    } catch (err) {
      console.error('Error cargando dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader />
      </div>
    )
  }

  if (!stats) return null

  const PROSPECT_STATUS_VARIANT = {
    NUEVO: 'info',
    EN_EVALUACION: 'warning',
    APROBADO: 'success',
    RECHAZADO: 'danger',
    CONVERTIDO: 'default',
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard</h1>
        <p className="text-sm text-slate-400">
          Resumen general del sistema · {formatDate(new Date())}
        </p>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon="🎯"
          title="Prospectos"
          value={stats.prospects.total}
          subtitle={`${stats.prospects.approved} aprobados`}
          onClick={() => navigate(ROUTES.PROSPECTOS)}
        />
        <KpiCard
          icon="🏢"
          title="Asociados"
          value={stats.associates.total}
          subtitle={`${stats.associates.active} activos`}
          onClick={() => navigate(ROUTES.ASOCIADOS)}
        />
        <KpiCard
          icon="📋"
          title="Membresías vigentes"
          value={stats.memberships}
          subtitle="Actualmente activas"
          onClick={() => navigate(ROUTES.MEMBRESIAS)}
        />
        <KpiCard
          icon="💰"
          title="Recaudado este mes"
          value={formatCurrency(stats.financial.collectedThisMonth)}
          subtitle="Pagos registrados"
          accent="text-emerald-700"
        />
      </div>

      {/* Cobranza */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div
          className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate(ROUTES.COBRANZA)}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📊</span>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pendiente de cobro
            </h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 mb-1">
            {formatCurrency(stats.financial.pending)}
          </p>
          <p className="text-xs text-slate-400">
            {stats.financial.pendingCount} cuotas pendientes
          </p>
        </div>

        <div
          className={`bg-white border rounded-lg p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
            stats.financial.overdueCount > 0
              ? 'border-red-200 bg-red-50/30'
              : 'border-slate-200'
          }`}
          onClick={() => navigate(ROUTES.COBRANZA)}
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⚠️</span>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Monto vencido
            </h3>
          </div>
          <p
            className={`text-2xl font-bold mb-1 ${
              stats.financial.overdueCount > 0
                ? 'text-red-600'
                : 'text-slate-900'
            }`}
          >
            {formatCurrency(stats.financial.overdue)}
          </p>
          <p className="text-xs text-slate-400">
            {stats.financial.overdueCount} cuotas vencidas
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📈</span>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tasa de cobro
            </h3>
          </div>
          {stats.financial.pending + stats.financial.collectedThisMonth > 0 ? (
            <>
              <p className="text-2xl font-bold text-slate-900 mb-1">
                {Math.round(
                  (stats.financial.collectedThisMonth /
                    (stats.financial.pending +
                      stats.financial.collectedThisMonth)) *
                    100
                )}
                %
              </p>
              <p className="text-xs text-slate-400">
                Cobrado vs. total esperado
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl font-bold text-slate-300 mb-1">—</p>
              <p className="text-xs text-slate-400">Sin datos aún</p>
            </>
          )}
        </div>
      </div>

      {/* Dos columnas: Próximas cuotas + Últimos prospectos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas cuotas */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">
              Próximas cuotas por vencer
            </h3>
            <button
              className="text-xs text-blue-500 hover:text-blue-700 font-medium"
              onClick={() => navigate(ROUTES.COBRANZA)}
            >
              Ver todo →
            </button>
          </div>
          {stats.upcomingSchedules.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              Sin cuotas próximas.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.upcomingSchedules.map((s) => (
                <div
                  key={s.id}
                  className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() =>
                    navigate(`${ROUTES.ASOCIADOS}/${s.associate?.id}`)
                  }
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {s.associate?.company_name || '—'}
                    </p>
                    <p className="text-xs text-slate-400">
                      Vence: {formatDate(s.due_date)}
                      <span className="ml-2 text-slate-300">
                        {s.associate?.internal_code}
                      </span>
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-900 whitespace-nowrap ml-3">
                    {formatCurrency(s.expected_amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos prospectos */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-700">
              Últimos prospectos
            </h3>
            <button
              className="text-xs text-blue-500 hover:text-blue-700 font-medium"
              onClick={() => navigate(ROUTES.PROSPECTOS)}
            >
              Ver todo →
            </button>
          </div>
          {stats.recentProspects.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              Sin prospectos registrados.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {stats.recentProspects.map((p) => {
                const statusCode = p.prospect_status?.code
                const variant =
                  PROSPECT_STATUS_VARIANT[statusCode] || 'default'
                return (
                  <div
                    key={p.id}
                    className="px-5 py-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() =>
                      navigate(`${ROUTES.PROSPECTOS}/${p.id}`)
                    }
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {p.company_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {formatDate(p.created_at)}
                      </p>
                    </div>
                    <Badge variant={variant}>
                      {p.prospect_status?.label || '—'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KpiCard({ icon, title, value, subtitle, accent, onClick }) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg p-5 shadow-sm transition-shadow ${
        onClick
          ? 'cursor-pointer hover:shadow-md'
          : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <p className={`text-2xl font-bold mb-1 ${accent || 'text-slate-900'}`}>
        {value}
      </p>
      <p className="text-xs text-slate-400">{subtitle}</p>
    </div>
  )
}
