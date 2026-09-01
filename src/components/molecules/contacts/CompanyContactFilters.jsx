import { Input } from '../../atoms/Input'
import { CatalogSelect } from '../CatalogSelect'
import { CategorySelect } from '../CategorySelect'
import { ChecklistFilter } from '../ChecklistFilter'
import { useCatalog } from '../../../hooks/useCatalog'
import { useCommittees } from '../../../hooks/useCommittees'
import { ASSOCIATE_CATALOG_GROUPS } from '../../../utils/associateConstants'
import {
  buildCommitteeOptions,
  buildContactCriteriaOptions,
} from '../../../utils/companyContactFilterUtils'

export function CompanyContactFilters({ filters, onClear, onFilterChange }) {
  const { items: areas, loading: areasLoading } = useCatalog(ASSOCIATE_CATALOG_GROUPS.AREA)
  const { committees, loading: committeesLoading } = useCommittees({ activeOnly: true })

  return (
    <div className="mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="min-w-[220px] flex-1">
        <FilterLabel>Buscar</FilterLabel>
        <Input
          placeholder="Contacto, cargo, correo, empresa, RUC..."
          value={filters.search}
          onChange={(event) => onFilterChange({ search: event.target.value })}
        />
      </div>

      <div className="w-56">
        <FilterLabel>Tipo / área</FilterLabel>
        <ChecklistFilter
          emptyLabel="Todos"
          loading={areasLoading}
          options={buildContactCriteriaOptions(areas)}
          selectedValues={filters.contactCriteria}
          onChange={(contactCriteria) => onFilterChange({ contactCriteria })}
        />
      </div>

      <div className="w-52">
        <FilterLabel>Comités</FilterLabel>
        <ChecklistFilter
          emptyLabel="Todos"
          loading={committeesLoading}
          options={buildCommitteeOptions(committees)}
          selectedValues={filters.committeeIds}
          onChange={(committeeIds) => onFilterChange({ committeeIds })}
        />
      </div>

      <CatalogFilter
        groupCode={ASSOCIATE_CATALOG_GROUPS.STATUS}
        label="Estado asociado"
        name="statusId"
        placeholder="Todos"
        value={filters.statusId}
        onFilterChange={onFilterChange}
      />

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

      <button type="button" className="pb-2 text-xs text-slate-400 underline hover:text-slate-600" onClick={onClear}>
        Limpiar
      </button>
    </div>
  )
}

function CatalogFilter({ groupCode, label, name, onFilterChange, placeholder, value }) {
  return (
    <div className="w-44">
      <FilterLabel>{label}</FilterLabel>
      <CatalogSelect
        groupCode={groupCode}
        name={name}
        value={value}
        onChange={(event) => onFilterChange({ [name]: event.target.value })}
        placeholder={placeholder}
      />
    </div>
  )
}

function FilterLabel({ children }) {
  return <label className="mb-1 block text-xs font-semibold text-slate-600">{children}</label>
}
