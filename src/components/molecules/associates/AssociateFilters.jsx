import { Input } from '../../atoms/Input'
import { CatalogSelect } from '../CatalogSelect'
import { CategorySelect } from '../CategorySelect'
import { ASSOCIATE_CATALOG_GROUPS } from '../../../utils/associateConstants'

export function AssociateFilters({ filters, onFilterChange, onClear }) {
  return (
    <div className="flex flex-wrap items-end gap-3 mb-6 bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex-1 min-w-[200px]">
        <label className="text-xs font-semibold text-slate-600 mb-1 block">
          Buscar
        </label>
        <Input
          placeholder="Razón social, RUC, código..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
      </div>

      <div className="w-44">
        <label className="text-xs font-semibold text-slate-600 mb-1 block">
          Estado
        </label>
        <CatalogSelect
          groupCode={ASSOCIATE_CATALOG_GROUPS.STATUS}
          value={filters.statusId}
          onChange={(e) => onFilterChange({ statusId: e.target.value })}
          name="statusId"
          placeholder="Todos"
        />
      </div>

      <div className="w-44">
        <label className="text-xs font-semibold text-slate-600 mb-1 block">
          Categoría
        </label>
        <CategorySelect
          value={filters.categoryId}
          onChange={(e) => onFilterChange({ categoryId: e.target.value })}
          name="categoryId"
          placeholder="Todas"
        />
      </div>

      <button
        type="button"
        className="text-xs text-slate-400 hover:text-slate-600 underline pb-1"
        onClick={onClear}
      >
        Limpiar
      </button>
    </div>
  )
}
