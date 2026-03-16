import { Input } from '../../atoms/Input'
import { Button } from '../../atoms/Button'
import { CatalogSelect } from '../CatalogSelect'
import { PROSPECT_CATALOG_GROUPS } from '../../../utils/prospectConstants'

export function ProspectFilters({ filters, onFilterChange, onClear }) {
  const handleSearch = (e) => {
    onFilterChange({ search: e.target.value })
  }

  const handleStatus = (e) => {
    onFilterChange({ statusId: e.target.value })
  }

  const hasActiveFilters =
    filters.search || filters.statusId || filters.categoryId

  return (
    <div className="flex flex-wrap items-end gap-3 mb-5">
      <div className="flex-1 min-w-[200px] max-w-xs">
        <label className="text-xs font-semibold text-slate-800 mb-1 block">
          Buscar
        </label>
        <Input
          placeholder="Razón social, RUC, contacto..."
          value={filters.search}
          onChange={handleSearch}
        />
      </div>

      <div className="w-48">
        <label className="text-xs font-semibold text-slate-800 mb-1 block">
          Estado
        </label>
        <CatalogSelect
          groupCode={PROSPECT_CATALOG_GROUPS.STATUS}
          value={filters.statusId}
          onChange={handleStatus}
          placeholder="Todos"
        />
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
