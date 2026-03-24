import { Button } from '../../atoms/Button'

/**
 * Sección de reporte con tabla, conteo e botón de exportación
 */
export function ReportSection({ title, subtitle, count, onExport, exportLabel, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-700">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
          {count != null && (
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {count} registros
            </span>
          )}
          {onExport && (
            <Button variant="secondary" size="sm" onClick={onExport}>
              📥 {exportLabel || 'Exportar Excel'}
            </Button>
          )}
        </div>
      </div>
      <div>{children}</div>
    </div>
  )
}
