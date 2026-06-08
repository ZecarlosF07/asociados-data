import { Input } from '../../atoms/Input'
import { MONTH_NAMES } from '../../../utils/paymentScheduleUtils'

export function PendingPaymentsFilters({
  selectedMonth,
  selectedYear,
  showAllMonths,
  viewMode,
  search,
  onPrevMonth,
  onNextMonth,
  onCurrentMonth,
  onToggleAllMonths,
  onToggleViewMode,
  onSearchChange,
  onClearSearch,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6 bg-white border border-slate-200 rounded-lg p-4">
      <div className="flex items-center gap-1">
        <button
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          onClick={onPrevMonth}
          title="Mes anterior"
        >
          ◀
        </button>

        <div className="min-w-[160px] text-center">
          <span className="text-sm font-bold text-slate-900">
            {showAllMonths
              ? 'Todos los meses'
              : `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
          </span>
        </div>

        <button
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          onClick={onNextMonth}
          title="Mes siguiente"
        >
          ▶
        </button>
      </div>

      <FilterButton active={!showAllMonths} onClick={onCurrentMonth}>
        Mes actual
      </FilterButton>
      <FilterButton active={showAllMonths} onClick={onToggleAllMonths}>
        Ver todo
      </FilterButton>
      <FilterButton active={viewMode === 'paid'} onClick={onToggleViewMode}>
        {viewMode === 'paid' ? 'Ver pendientes' : 'Ver pagadas'}
      </FilterButton>

      <div className="flex-1 min-w-[180px] ml-auto">
        <Input
          placeholder="Buscar asociado..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      {search && (
        <button
          type="button"
          className="text-xs text-slate-400 hover:text-slate-600 underline"
          onClick={onClearSearch}
        >
          Limpiar
        </button>
      )}
    </div>
  )
}

function FilterButton({ active, onClick, children }) {
  return (
    <button
      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
        active
          ? 'bg-slate-900 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
