import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/atoms/Button'
import { EmptyState } from '../../components/atoms/EmptyState'
import { Loader } from '../../components/atoms/Loader'
import { MembershipFilters } from '../../components/molecules/financial/MembershipFilters'
import { MembershipTable } from '../../components/molecules/financial/MembershipTable'
import { useActiveMemberships } from '../../hooks/useActiveMemberships'
import { useNotification } from '../../hooks/useNotification'
import { ROUTES } from '../../router/routes'
import { todayDateOnly } from '../../utils/dateOnly'
import { EXPORT_COLUMNS, exportToExcel } from '../../utils/exportUtils'

export function MembershipsPage() {
  const navigate = useNavigate()
  const { notify } = useNotification()
  const memberships = useActiveMemberships()

  const handleExport = async () => {
    try {
      await exportToExcel({
        filename: `membresias_vigentes_${todayDateOnly()}`,
        sheetName: 'Membresías vigentes',
        data: memberships.filteredMemberships,
        columns: EXPORT_COLUMNS.memberships,
      })
      notify.success('Excel exportado correctamente')
    } catch (error) {
      notify.error(`No se pudo exportar: ${error.message}`)
    }
  }

  const handleMembershipClick = (membership) => {
    navigate(`${ROUTES.ASOCIADOS}/${membership.associate_id}`)
  }

  return (
    <div className="max-w-6xl">
      <PageHeader
        exportDisabled={memberships.loading || memberships.filteredMemberships.length === 0}
        filteredCount={memberships.filteredMemberships.length}
        loading={memberships.loading}
        onExport={handleExport}
        totalCount={memberships.totalActiveCount}
      />

      <MembershipFilters
        filters={memberships.filters}
        onClear={memberships.clearFilters}
        onFilterChange={memberships.updateFilters}
      />

      <MembershipContent
        memberships={memberships}
        onMembershipClick={handleMembershipClick}
      />
    </div>
  )
}

function PageHeader({ exportDisabled, filteredCount, loading, onExport, totalCount }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="mb-1 text-2xl font-bold text-slate-900">Membresías</h1>
        <p className="text-sm text-slate-400">
          {loading
            ? 'Vista global de las membresías vigentes.'
            : `${filteredCount} de ${totalCount} membresías vigentes.`}
        </p>
      </div>
      <Button size="sm" variant="secondary" disabled={exportDisabled} onClick={onExport}>
        📥 Exportar Excel
      </Button>
    </div>
  )
}

function MembershipContent({ memberships, onMembershipClick }) {
  if (memberships.loading) {
    return <div className="flex justify-center py-16"><Loader /></div>
  }

  if (memberships.error) {
    return <EmptyState icon="!" title="No se pudo cargar" description={memberships.error} />
  }

  if (memberships.filteredMemberships.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title={memberships.totalActiveCount === 0 ? 'No hay membresías vigentes' : 'Sin resultados'}
        description={getEmptyDescription(memberships)}
      />
    )
  }

  return (
    <MembershipTable
      memberships={memberships.filteredMemberships}
      onMembershipClick={onMembershipClick}
    />
  )
}

function getEmptyDescription(memberships) {
  if (memberships.hasFilters) {
    return 'No se encontraron membresías vigentes con los filtros aplicados.'
  }
  return 'Registra o renueva una membresía desde la ficha del asociado.'
}
