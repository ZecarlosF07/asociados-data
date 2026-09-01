import { Input } from '../../atoms/Input'
import { CatalogSelect } from '../CatalogSelect'
import { CategorySelect } from '../CategorySelect'
import { FINANCIAL_CATALOG_GROUPS } from '../../../utils/financialConstants'

export function MembershipFilters({ filters, onClear, onFilterChange }) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="min-w-[200px] flex-1">
        <label className="mb-1 block text-xs font-semibold text-slate-600">
          Buscar asociado
        </label>
        <Input
          placeholder="Razón social, RUC, código..."
          value={filters.search}
          onChange={(event) => onFilterChange({ search: event.target.value })}
        />
      </div>

      <div className="w-44">
        <label className="mb-1 block text-xs font-semibold text-slate-600">
          Tipo
        </label>
        <CatalogSelect
          groupCode={FINANCIAL_CATALOG_GROUPS.MEMBERSHIP_TYPE}
          value={filters.typeId}
          onChange={(event) => onFilterChange({ typeId: event.target.value })}
          name="typeId"
          placeholder="Todos"
        />
      </div>

      <div className="w-52">
        <label className="mb-1 block text-xs font-semibold text-slate-600">
          Categoría
        </label>
        <CategorySelect
          value={filters.categoryId}
          onChange={(event) => onFilterChange({ categoryId: event.target.value })}
          name="categoryId"
          placeholder="Todas"
        />
      </div>

      <button
        type="button"
        className="pb-1 text-xs text-slate-400 underline hover:text-slate-600"
        onClick={onClear}
      >
        Limpiar
      </button>
    </div>
  )
}
