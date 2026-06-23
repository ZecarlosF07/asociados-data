import { Input } from '../../atoms/Input'
import { CatalogSelect } from '../CatalogSelect'
import { CategorySelect } from '../CategorySelect'
import { ASSOCIATE_CATALOG_GROUPS } from '../../../utils/associateConstants'

export function CompanyContactFilters({ filters, onClear, onFilterChange }) {
  return (
    <div className="flex flex-wrap items-end gap-3 mb-6 bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex-1 min-w-[220px]">
        <FilterLabel>Buscar</FilterLabel>
        <Input
          placeholder="Contacto, cargo, correo, empresa, RUC..."
          value={filters.search}
          onChange={(event) => onFilterChange({ search: event.target.value })}
        />
      </div>

      <div className="w-44">
        <FilterLabel>Área</FilterLabel>
        <CatalogSelect
          groupCode={ASSOCIATE_CATALOG_GROUPS.AREA}
          name="areaId"
          value={filters.areaId}
          onChange={(event) => onFilterChange({ areaId: event.target.value })}
          placeholder="Todas"
        />
      </div>

      <div className="w-44">
        <FilterLabel>Estado asociado</FilterLabel>
        <CatalogSelect
          groupCode={ASSOCIATE_CATALOG_GROUPS.STATUS}
          name="statusId"
          value={filters.statusId}
          onChange={(event) => onFilterChange({ statusId: event.target.value })}
          placeholder="Todos"
        />
      </div>

      <div className="w-44">
        <FilterLabel>Categoría</FilterLabel>
        <CategorySelect
          name="categoryId"
          value={filters.categoryId}
          onChange={(event) => onFilterChange({ categoryId: event.target.value })}
          placeholder="Todas"
        />
      </div>

      <label className="flex items-center gap-2 pb-2 text-xs font-semibold text-slate-600">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-blue-600"
          checked={filters.onlyPrimary}
          onChange={(event) => onFilterChange({ onlyPrimary: event.target.checked })}
        />
        Solo principales
      </label>

      <button
        type="button"
        className="text-xs text-slate-400 hover:text-slate-600 underline pb-2"
        onClick={onClear}
      >
        Limpiar
      </button>
    </div>
  )
}

function FilterLabel({ children }) {
  return (
    <label className="text-xs font-semibold text-slate-600 mb-1 block">
      {children}
    </label>
  )
}
