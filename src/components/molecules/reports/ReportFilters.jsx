import { Input } from '../../atoms/Input'
import { MONTH_OPTIONS } from '../../../utils/reportFilterUtils'

export function ReportFilters({
  search,
  searchPlaceholder = 'Buscar por razón social o RUC',
  onSearchChange,
  year,
  years = [],
  onYearChange,
  month,
  onMonthChange,
  category,
  categories = [],
  onCategoryChange,
  onClear,
}) {
  const hasPeriod = Boolean(onYearChange || onMonthChange)
  const hasCategory = Boolean(onCategoryChange)

  return (
    <div className="flex flex-wrap items-end gap-3 bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex-1 min-w-[240px]">
        <label className="text-xs font-semibold text-slate-600 mb-1 block">
          Buscar
        </label>
        <Input
          value={search}
          placeholder={searchPlaceholder}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      {hasPeriod && (
        <>
          <div className="w-36">
            <label className="text-xs font-semibold text-slate-600 mb-1 block">
              Año
            </label>
            <select
              className="w-full h-10 border border-slate-200 rounded-md px-3 text-sm text-slate-700 bg-white"
              value={year}
              onChange={(event) => onYearChange(event.target.value)}
            >
              <option value="">Todos</option>
              {years.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <label className="text-xs font-semibold text-slate-600 mb-1 block">
              Mes
            </label>
            <select
              className="w-full h-10 border border-slate-200 rounded-md px-3 text-sm text-slate-700 bg-white"
              value={month}
              onChange={(event) => onMonthChange(event.target.value)}
            >
              <option value="">Todos</option>
              {MONTH_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {hasCategory && (
        <div className="w-48">
          <label className="text-xs font-semibold text-slate-600 mb-1 block">
            Categoría
          </label>
          <select
            className="w-full h-10 border border-slate-200 rounded-md px-3 text-sm text-slate-700 bg-white"
            value={category}
            onChange={(event) => onCategoryChange(event.target.value)}
          >
            <option value="">Todas</option>
            {categories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

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
