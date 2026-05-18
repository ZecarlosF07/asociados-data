import {
  getAuditChangedFields,
  safeJsonPreview,
} from '../../../utils/auditFormatters'

export function AuditChangeSummary({ previousData, newData }) {
  const changes = getAuditChangedFields(previousData, newData)

  if (changes.length === 0) {
    return (
      <p className="text-xs text-slate-400">
        No hay diferencias de primer nivel para mostrar.
      </p>
    )
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-[1fr_1.5fr_1.5fr] bg-slate-50 text-xs font-bold text-slate-600">
        <Cell>Campo</Cell>
        <Cell>Antes</Cell>
        <Cell>Después</Cell>
      </div>
      {changes.slice(0, 20).map((change) => (
        <div
          key={change.field}
          className="grid grid-cols-[1fr_1.5fr_1.5fr] border-t border-slate-100 text-xs"
        >
          <Cell strong>{change.label}</Cell>
          <Cell>{safeJsonPreview(change.previousValue)}</Cell>
          <Cell>{safeJsonPreview(change.newValue)}</Cell>
        </div>
      ))}
      {changes.length > 20 && (
        <p className="px-3 py-2 text-xs text-slate-400 border-t border-slate-100">
          Se muestran 20 de {changes.length} campos modificados.
        </p>
      )}
    </div>
  )
}

function Cell({ children, strong = false }) {
  return (
    <div className={`p-2 min-w-0 break-words ${strong ? 'font-semibold text-slate-700' : 'text-slate-500'}`}>
      {children}
    </div>
  )
}
