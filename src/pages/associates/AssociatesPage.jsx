import { useNavigate } from 'react-router-dom'
import { useAssociates } from '../../hooks/useAssociates'
import { usePermissions } from '../../hooks/usePermissions'
import { AssociateFilters } from '../../components/molecules/associates/AssociateFilters'
import { AssociateListItem } from '../../components/molecules/associates/AssociateListItem'
import { Button } from '../../components/atoms/Button'
import { Loader } from '../../components/atoms/Loader'
import { EmptyState } from '../../components/atoms/EmptyState'
import { ROUTES } from '../../router/routes'

export function AssociatesPage() {
  const navigate = useNavigate()
  const { canCreate } = usePermissions()
  const canCreateAssociate = canCreate('asociados')
  const { associates, loading, error, filters, updateFilters } = useAssociates()

  const handleClearFilters = () => {
    updateFilters({
      search: '',
      statusId: '',
      categoryId: '',
      committeeId: '',
      withoutCommittee: false,
    })
  }

  const handleAssociateClick = (associate) => {
    navigate(`${ROUTES.ASOCIADOS}/${associate.id}`)
  }

  return (
    <div className="max-w-6xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Asociados</h1>
          <p className="text-sm text-slate-400">
            Gestión de empresas asociadas y su ficha institucional.
          </p>
        </div>
        {canCreateAssociate && (
          <Button onClick={() => navigate(ROUTES.ASOCIADOS_NUEVO)}>
            + Nuevo asociado
          </Button>
        )}
      </div>

      <AssociateFilters
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
      ) : associates.length === 0 ? (
        <EmptyState
          icon="🏢"
          title="Sin asociados"
          description="No se encontraron asociados con los filtros aplicados."
          action={
            canCreateAssociate && (
              <Button size="sm" onClick={() => navigate(ROUTES.ASOCIADOS_NUEVO)}>
                Registrar primer asociado
              </Button>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {associates.map((associate) => (
            <AssociateListItem
              key={associate.id}
              associate={associate}
              onClick={handleAssociateClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
