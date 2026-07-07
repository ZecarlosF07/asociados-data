import { Input } from '../../atoms/Input'

export function CommitteeReportFilters({ filters, onChange, onClear, options }) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="min-w-[220px] flex-1">
        <FilterLabel>Buscar</FilterLabel>
        <Input
          value={filters.search}
          placeholder="Comité, razón social, código o RUC"
          onChange={(event) => onChange({ search: event.target.value })}
        />
      </div>
      <FilterSelect
        label="Comité"
        value={filters.committeeId}
        options={options.committees}
        onChange={(committeeId) => onChange({ committeeId })}
      />
      <FilterSelect
        label="Estado asociado"
        value={filters.statusCode}
        options={options.statuses}
        onChange={(statusCode) => onChange({ statusCode })}
      />
      <FilterSelect
        label="Categoría"
        value={filters.categoryCode}
        options={options.categories}
        onChange={(categoryCode) => onChange({ categoryCode })}
      />
      <button
        type="button"
        className="pb-2 text-xs text-slate-400 underline hover:text-slate-600"
        onClick={onClear}
      >
        Limpiar
      </button>
    </div>
  )
}

function FilterSelect({ label, onChange, options, value }) {
  return (
    <div className="w-44">
      <FilterLabel>{label}</FilterLabel>
      <select
        className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  )
}

function FilterLabel({ children }) {
  return <label className="mb-1 block text-xs font-semibold text-slate-600">{children}</label>
}
