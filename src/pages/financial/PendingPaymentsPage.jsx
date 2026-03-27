import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { paymentSchedulesService } from '../../services/paymentSchedules.service'
import { paymentsService } from '../../services/payments.service'
import { collectionActionsService } from '../../services/collectionActions.service'
import { useUserProfile } from '../../hooks/useUserProfile'
import { useNotification } from '../../hooks/useNotification'
import { usePermissions } from '../../hooks/usePermissions'
import { Input } from '../../components/atoms/Input'
import { Badge } from '../../components/atoms/Badge'
import { Button } from '../../components/atoms/Button'
import { Loader } from '../../components/atoms/Loader'
import { EmptyState } from '../../components/atoms/EmptyState'
import { PaymentForm } from '../../components/molecules/financial/PaymentForm'
import { CollectionActionForm } from '../../components/molecules/financial/CollectionActionForm'
import { formatDate, formatCurrency } from '../../utils/helpers'
import { COLLECTION_STATUS_VARIANT } from '../../utils/financialConstants'
import { ROUTES } from '../../router/routes'

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function PendingPaymentsPage() {
  const navigate = useNavigate()
  const { profile } = useUserProfile()
  const { notify } = useNotification()
  const { canEdit } = usePermissions()
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [activePaymentRow, setActivePaymentRow] = useState(null)
  const [activeCollectionRow, setActiveCollectionRow] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Filtro de mes: por defecto mes actual
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1) // 1-12
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [showAllMonths, setShowAllMonths] = useState(false)

  const fetchPending = useCallback(async () => {
    setLoading(true)
    try {
      const data = await paymentSchedulesService.getPending()
      setSchedules(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPending()
  }, [fetchPending])

  // Filtrar por búsqueda + mes
  const filtered = useMemo(() => {
    let result = schedules

    // Filtrar por mes/año (salvo si está en modo "todos los meses")
    if (!showAllMonths) {
      result = result.filter((s) => {
        const due = new Date(s.due_date)
        return (
          due.getMonth() + 1 === selectedMonth &&
          due.getFullYear() === selectedYear
        )
      })
    }

    // Filtrar por búsqueda de texto
    if (search) {
      const term = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.associate?.company_name?.toLowerCase().includes(term) ||
          s.associate?.ruc?.includes(term) ||
          s.associate?.internal_code?.toLowerCase().includes(term)
      )
    }

    return result
  }, [schedules, selectedMonth, selectedYear, showAllMonths, search])

  // Separar vencidos y próximos
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const overdue = filtered.filter((s) => new Date(s.due_date) < today)
  const upcoming = filtered.filter((s) => new Date(s.due_date) >= today)

  // Totales del mes filtrado
  const totalPending = filtered.reduce(
    (sum, s) => sum + Number(s.expected_amount || 0), 0
  )
  const totalOverdue = overdue.reduce(
    (sum, s) => sum + Number(s.expected_amount || 0), 0
  )

  // Navegar entre meses
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12)
      setSelectedYear((y) => y - 1)
    } else {
      setSelectedMonth((m) => m - 1)
    }
    setShowAllMonths(false)
  }

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1)
      setSelectedYear((y) => y + 1)
    } else {
      setSelectedMonth((m) => m + 1)
    }
    setShowAllMonths(false)
  }

  const handleCurrentMonth = () => {
    setSelectedMonth(now.getMonth() + 1)
    setSelectedYear(now.getFullYear())
    setShowAllMonths(false)
  }

  // Registrar pago desde cobranza
  const handlePaymentSubmit = async (data) => {
    setActionLoading(true)
    try {
      const schedule = schedules.find((s) => s.id === activePaymentRow)

      await paymentsService.create({
        ...data,
        associate_id: schedule.associate_id,
        membership_id: schedule.membership_id,
        payment_schedule_id: schedule.id,
        registered_by_user_id: profile?.id,
        created_by: profile?.id,
      })

      await paymentSchedulesService.markAsPaid(schedule.id, {
        userId: profile?.id,
      })

      notify.success('Pago registrado y cuota marcada como pagada')
      setActivePaymentRow(null)
      fetchPending()
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  // Registrar gestión de cobranza
  const handleCollectionSubmit = async (data) => {
    setActionLoading(true)
    try {
      const schedule = schedules.find((s) => s.id === activeCollectionRow)

      await collectionActionsService.create({
        ...data,
        associate_id: schedule.associate_id,
        payment_schedule_id: schedule.id,
        managed_by_user_id: profile?.id,
        created_by: profile?.id,
      })

      notify.success('Gestión de cobranza registrada')
      setActiveCollectionRow(null)
    } catch (error) {
      notify.error('Error: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Cobranza</h1>
        <p className="text-sm text-slate-400">
          Cuotas pendientes de cobro, ordenadas por fecha de vencimiento.
        </p>
      </div>

      {/* Filtro de mes */}
      <div className="flex flex-wrap items-center gap-3 mb-6 bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex items-center gap-1">
          <button
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            onClick={handlePrevMonth}
            title="Mes anterior"
          >
            ◀
          </button>

          <div className="min-w-[160px] text-center">
            <span className="text-sm font-bold text-slate-900">
              {showAllMonths
                ? 'Todos los meses'
                : `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
            </span>
          </div>

          <button
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
            onClick={handleNextMonth}
            title="Mes siguiente"
          >
            ▶
          </button>
        </div>

        <div className="flex items-center gap-2 ml-2">
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              !showAllMonths && selectedMonth === now.getMonth() + 1 && selectedYear === now.getFullYear()
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            onClick={handleCurrentMonth}
          >
            Mes actual
          </button>
          <button
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              showAllMonths
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            onClick={() => setShowAllMonths(!showAllMonths)}
          >
            Ver todo
          </button>
        </div>

        <div className="flex-1 min-w-[180px] ml-auto">
          <Input
            placeholder="Buscar asociado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {search && (
          <button
            type="button"
            className="text-xs text-slate-400 hover:text-slate-600 underline"
            onClick={() => setSearch('')}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Resumen del mes */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <SummaryCard
            label={showAllMonths ? 'Total pendiente' : `Pendiente ${MONTH_NAMES[selectedMonth - 1]}`}
            value={formatCurrency(totalPending)}
            accent="text-slate-900"
          />
          <SummaryCard
            label="Cuotas"
            value={String(filtered.length)}
            accent="text-slate-900"
          />
          <SummaryCard
            label="Vencidas"
            value={String(overdue.length)}
            accent="text-red-600"
          />
          <SummaryCard
            label="Monto vencido"
            value={formatCurrency(totalOverdue)}
            accent="text-red-600"
          />
        </div>
      )}

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="✅"
          title="Sin cuotas pendientes"
          description={
            showAllMonths
              ? search
                ? 'No se encontraron cuotas para esa búsqueda.'
                : 'Todos los asociados están al día.'
              : `No hay cuotas pendientes en ${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}.`
          }
        />
      ) : (
        <div className="space-y-6">
          {overdue.length > 0 && (
            <ScheduleSection
              title={`Vencidas (${overdue.length})`}
              items={overdue}
              variant="danger"
              canEdit={canEdit}
              activePaymentRow={activePaymentRow}
              activeCollectionRow={activeCollectionRow}
              actionLoading={actionLoading}
              onNavigate={(id) => navigate(`${ROUTES.ASOCIADOS}/${id}`)}
              onPayClick={(id) => {
                setActivePaymentRow(activePaymentRow === id ? null : id)
                setActiveCollectionRow(null)
              }}
              onCollectionClick={(id) => {
                setActiveCollectionRow(activeCollectionRow === id ? null : id)
                setActivePaymentRow(null)
              }}
              onPaymentSubmit={handlePaymentSubmit}
              onCollectionSubmit={handleCollectionSubmit}
              schedules={schedules}
            />
          )}

          {upcoming.length > 0 && (
            <ScheduleSection
              title={`Próximas (${upcoming.length})`}
              items={upcoming}
              variant="warning"
              canEdit={canEdit}
              activePaymentRow={activePaymentRow}
              activeCollectionRow={activeCollectionRow}
              actionLoading={actionLoading}
              onNavigate={(id) => navigate(`${ROUTES.ASOCIADOS}/${id}`)}
              onPayClick={(id) => {
                setActivePaymentRow(activePaymentRow === id ? null : id)
                setActiveCollectionRow(null)
              }}
              onCollectionClick={(id) => {
                setActiveCollectionRow(activeCollectionRow === id ? null : id)
                setActivePaymentRow(null)
              }}
              onPaymentSubmit={handlePaymentSubmit}
              onCollectionSubmit={handleCollectionSubmit}
              schedules={schedules}
            />
          )}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, value, accent }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
      <p className={`text-xl font-bold ${accent}`}>{value}</p>
    </div>
  )
}

function ScheduleSection({
  title,
  items,
  variant,
  canEdit,
  activePaymentRow,
  activeCollectionRow,
  actionLoading,
  onNavigate,
  onPayClick,
  onCollectionClick,
  onPaymentSubmit,
  onCollectionSubmit,
  schedules,
}) {
  const borderColor =
    variant === 'danger' ? 'border-red-200' : 'border-amber-200'
  const bgColor =
    variant === 'danger' ? 'bg-red-50/40' : 'bg-amber-50/40'
  const titleColor =
    variant === 'danger' ? 'text-red-700' : 'text-amber-700'

  return (
    <div className={`border ${borderColor} ${bgColor} rounded-lg overflow-hidden`}>
      <div className="px-4 py-3">
        <h2 className={`text-sm font-bold ${titleColor}`}>{title}</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm bg-white">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="text-left py-2 px-4 text-xs font-semibold text-slate-500">
                Asociado
              </th>
              <th className="text-left py-2 px-4 text-xs font-semibold text-slate-500">
                Período
              </th>
              <th className="text-left py-2 px-4 text-xs font-semibold text-slate-500">
                Vencimiento
              </th>
              <th className="text-right py-2 px-4 text-xs font-semibold text-slate-500">
                Monto
              </th>
              <th className="text-center py-2 px-4 text-xs font-semibold text-slate-500">
                Estado
              </th>
              {canEdit && (
                <th className="text-center py-2 px-4 text-xs font-semibold text-slate-500">
                  Acciones
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((s) => {
              const statusCode = s.collection_status?.code
              const badgeVariant =
                COLLECTION_STATUS_VARIANT[statusCode] || 'default'
              const periodLabel = s.period_month
                ? `${String(s.period_month).padStart(2, '0')}/${s.period_year}`
                : String(s.period_year)

              return (
                <ScheduleRow
                  key={s.id}
                  schedule={s}
                  periodLabel={periodLabel}
                  badgeVariant={badgeVariant}
                  canEdit={canEdit}
                  isPayOpen={activePaymentRow === s.id}
                  isCollectionOpen={activeCollectionRow === s.id}
                  actionLoading={actionLoading}
                  onNavigate={onNavigate}
                  onPayClick={onPayClick}
                  onCollectionClick={onCollectionClick}
                  onPaymentSubmit={onPaymentSubmit}
                  onCollectionSubmit={onCollectionSubmit}
                  schedules={schedules}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ScheduleRow({
  schedule: s,
  periodLabel,
  badgeVariant,
  canEdit,
  isPayOpen,
  isCollectionOpen,
  actionLoading,
  onNavigate,
  onPayClick,
  onCollectionClick,
  onPaymentSubmit,
  onCollectionSubmit,
  schedules,
}) {
  return (
    <>
      <tr className="border-b border-slate-100 hover:bg-slate-50">
        <td
          className="py-2 px-4 cursor-pointer"
          onClick={() => onNavigate(s.associate_id)}
        >
          <div className="font-medium text-slate-900">
            {s.associate?.company_name || '—'}
          </div>
          <div className="text-xs text-slate-400">
            {s.associate?.internal_code}
          </div>
        </td>
        <td className="py-2 px-4 text-slate-600">{periodLabel}</td>
        <td className="py-2 px-4 text-slate-600">
          {formatDate(s.due_date)}
        </td>
        <td className="py-2 px-4 text-right font-medium text-slate-900">
          {formatCurrency(s.expected_amount)}
        </td>
        <td className="py-2 px-4 text-center">
          <Badge variant={badgeVariant}>
            {s.collection_status?.label || '—'}
          </Badge>
        </td>
        {canEdit && (
          <td className="py-2 px-4 text-center">
            <div className="flex gap-1 justify-center">
              <Button
                size="sm"
                variant={isPayOpen ? 'primary' : 'secondary'}
                onClick={() => onPayClick(s.id)}
              >
                💳 Pagar
              </Button>
              <Button
                size="sm"
                variant={isCollectionOpen ? 'primary' : 'secondary'}
                onClick={() => onCollectionClick(s.id)}
              >
                📞 Gestión
              </Button>
            </div>
          </td>
        )}
      </tr>

      {isPayOpen && (
        <tr>
          <td colSpan={canEdit ? 6 : 5} className="px-4 py-3 bg-blue-50/50">
            <div className="max-w-2xl">
              <h4 className="text-xs font-bold text-slate-700 mb-2">
                Registrar pago — {s.associate?.company_name} — {periodLabel}
              </h4>
              <PaymentForm
                schedules={[s]}
                onSubmit={onPaymentSubmit}
                onCancel={() => onPayClick(null)}
                loading={actionLoading}
              />
            </div>
          </td>
        </tr>
      )}

      {isCollectionOpen && (
        <tr>
          <td colSpan={canEdit ? 6 : 5} className="px-4 py-3 bg-amber-50/50">
            <div className="max-w-2xl">
              <h4 className="text-xs font-bold text-slate-700 mb-2">
                Registrar gestión — {s.associate?.company_name} — {periodLabel}
              </h4>
              <CollectionActionForm
                onSubmit={onCollectionSubmit}
                onCancel={() => onCollectionClick(null)}
                loading={actionLoading}
              />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
