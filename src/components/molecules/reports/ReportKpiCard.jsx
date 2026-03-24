/**
 * Tarjeta de indicador KPI para paneles de reportes
 */
export function ReportKpiCard({ icon, title, value, subtitle, accent, onClick }) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg p-5 shadow-sm transition-shadow ${
        onClick ? 'cursor-pointer hover:shadow-md' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{icon}</span>
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <p className={`text-2xl font-bold mb-1 ${accent || 'text-slate-900'}`}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
    </div>
  )
}
