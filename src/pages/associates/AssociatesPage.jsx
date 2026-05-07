import { useNavigate } from 'react-router-dom'
import { useAssociates } from '../../hooks/useAssociates'
import { AssociateFilters } from '../../components/molecules/associates/AssociateFilters'
import { AssociateCard } from '../../components/molecules/associates/AssociateCard'
import { Loader } from '../../components/atoms/Loader'
import { EmptyState } from '../../components/atoms/EmptyState'
import { ROUTES } from '../../router/routes'

export function AssociatesPage() {
  const navigate = useNavigate()
  const { associates, loading, filters, updateFilters } = useAssociates()

  const handleClearFilters = () => {
    updateFilters({ search: '', statusId: '', categoryId: '' })
  }

  const handleCardClick = (associate) => {
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
      ) : associates.length === 0 ? (
        <EmptyState
          icon="🏢"
          title="Sin asociados"
          description="No se encontraron asociados con los filtros aplicados."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {associates.map((associate) => (
            <AssociateCard
              key={associate.id}
              associate={associate}
              onClick={handleCardClick}
            />
          ))}
        </div>
      )}
    </div>
  )
}
