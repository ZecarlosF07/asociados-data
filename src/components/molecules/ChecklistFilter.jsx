export function ChecklistFilter({
  disabled = false,
  emptyLabel = 'Todos',
  loading = false,
  onChange,
  options,
  selectedValues,
}) {
  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label)
  const summary = getSummary(selectedLabels, emptyLabel)

  const toggleValue = (value) => {
    const nextValues = selectedValues.includes(value)
      ? selectedValues.filter((selected) => selected !== value)
      : [...selectedValues, value]
    onChange(nextValues)
  }

  return (
    <details className="group relative" aria-disabled={disabled || loading}>
      <summary
        className={`flex w-full list-none items-center justify-between gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors [&::-webkit-details-marker]:hidden ${
          disabled || loading
            ? 'cursor-not-allowed bg-slate-50 opacity-70'
            : 'cursor-pointer focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10'
        }`}
        onClick={(event) => {
          if (disabled || loading) event.preventDefault()
        }}
      >
        <span className="truncate">{loading ? 'Cargando...' : summary}</span>
        <span className="text-xs text-slate-400 transition-transform group-open:rotate-180">⌄</span>
      </summary>

      <div className="absolute left-0 z-20 mt-1 max-h-72 w-72 overflow-y-auto rounded-md border border-slate-200 bg-white p-2 shadow-lg">
        {selectedValues.length > 0 && (
          <button
            type="button"
            className="mb-1 w-full rounded px-2 py-1 text-left text-xs text-blue-600 hover:bg-blue-50"
            onClick={() => onChange([])}
          >
            Limpiar selección
          </button>
        )}
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          >
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
              checked={selectedValues.includes(option.value)}
              onChange={() => toggleValue(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </details>
  )
}

function getSummary(selectedLabels, emptyLabel) {
  if (!selectedLabels.length) return emptyLabel
  if (selectedLabels.length === 1) return selectedLabels[0]
  return `${selectedLabels.length} seleccionados`
}
