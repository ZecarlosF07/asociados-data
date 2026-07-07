import { Input } from '../../atoms/Input'
import { CatalogSelect } from '../CatalogSelect'
import { CategorySelect } from '../CategorySelect'
import { ASSOCIATE_CATALOG_GROUPS } from '../../../utils/associateConstants'
import {
  COMPANY_CONTACT_TYPE_OPTIONS,
  isRepresentativeContactType,
} from '../../../utils/companyContactUtils'

export function CompanyContactFilters({ filters, onClear, onFilterChange }) {
  const areaDisabled = isRepresentativeContactType(filters.contactType)

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

      <div className="w-52">
        <FilterLabel>Tipo de contacto</FilterLabel>
        <select
          name="contactType"
          value={filters.contactType}
          onChange={(event) => onFilterChange({ contactType: event.target.value })}
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        >
          {COMPANY_CONTACT_TYPE_OPTIONS.map((option) => (
            <option key={option.value || 'all'} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="w-44">
        <FilterLabel>Área</FilterLabel>
        <CatalogSelect
          groupCode={ASSOCIATE_CATALOG_GROUPS.AREA}
          name="areaId"
          value={filters.areaId}
          onChange={(event) => onFilterChange({ areaId: event.target.value })}
          placeholder="Todas"
          disabled={areaDisabled}
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
