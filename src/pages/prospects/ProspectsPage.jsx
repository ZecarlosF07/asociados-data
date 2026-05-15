import { useNavigate } from 'react-router-dom'
import { useProspects } from '../../hooks/useProspects'
import { usePermissions } from '../../hooks/usePermissions'
import { ProspectFilters } from '../../components/molecules/prospects/ProspectFilters'
import { ProspectListItem } from '../../components/molecules/prospects/ProspectListItem'
import { Button } from '../../components/atoms/Button'
import { Loader } from '../../components/atoms/Loader'
import { EmptyState } from '../../components/atoms/EmptyState'
import { ROUTES } from '../../router/routes'

export function ProspectsPage() {
  const navigate = useNavigate()
  const { prospects, loading, error, filters, updateFilters } = useProspects()
  const { canCreate } = usePermissions()

  const handleClearFilters = () => {
    updateFilters({ search: '', statusId: '', categoryId: '', captadorId: '' })
  }

  const handleProspectClick = (prospect) => {
    navigate(`${ROUTES.PROSPECTOS}/${prospect.id}`)
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Prospectos</h1>
          <p className="text-sm text-slate-400">
            Gestión de empresas prospecto y su seguimiento comercial.
          </p>
        </div>
        {canCreate && (
          <Button onClick={() => navigate(ROUTES.PROSPECTOS_NUEVO)}>
            + Nuevo prospecto
          </Button>
        )}
      </div>

      <ProspectFilters
        filters={filters}
        onFilterChange={updateFilters}
        onClear={handleClearFilters}
      />

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader />
        </div>
      ) : error ? (
        <EmptyState
          icon="!"
          title="No se pudo cargar"
          description={error}
        />
      ) : prospects.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Sin prospectos"
          description="No se encontraron prospectos con los filtros aplicados."
          action={
            canCreate && (
              <Button size="sm" onClick={() => navigate(ROUTES.PROSPECTOS_NUEVO)}>
                Registrar primer prospecto
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {prospects.map((prospect) => (
            <ProspectListItem
              key={prospect.id}
              prospect={prospect}
              onClick={handleProspectClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
