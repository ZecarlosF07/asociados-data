/**
 * Gráfico de distribución horizontal por barras
 * Renderiza barras proporcionales con etiquetas y valores
 */
export function DistributionChart({ title, data, colorMap = {} }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <h3 className="text-sm font-bold text-slate-700 mb-3">{title}</h3>
        <p className="text-xs text-slate-400">Sin datos disponibles</p>
      </div>
    )
  }

  const total = Object.values(data).reduce((s, v) => s + v, 0)
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1])

  const defaultColors = [
    'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500',
    'bg-purple-500', 'bg-cyan-500', 'bg-orange-500', 'bg-pink-500',
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-700">{title}</h3>
        <span className="text-xs text-slate-400">{total} total</span>
      </div>

      <div className="space-y-3">
        {entries.map(([key, val], idx) => {
          const pct = total > 0 ? Math.round((val / total) * 100) : 0
          const color = colorMap[key] || defaultColors[idx % defaultColors.length]

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-slate-600">
                  {formatLabel(key)}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {val} <span className="text-slate-400 font-normal">({pct}%)</span>
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function formatLabel(code) {
  return code
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .toLowerCase()
    .replace(/\b\w/, (c) => c.toUpperCase())
}
