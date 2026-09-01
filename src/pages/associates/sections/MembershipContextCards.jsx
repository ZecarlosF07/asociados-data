import { Button } from '../../../components/atoms/Button'
import { formatCurrency } from '../../../utils/helpers'

export function MembershipCategoryWarning({ canEdit, onEdit }) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5">
      <div className="mr-auto">
        <h3 className="text-sm font-semibold text-amber-950">Falta asignar una categoría</h3>
        <p className="mt-1 text-sm text-amber-800">
          Asígnala primero desde Información para habilitar la membresía.
        </p>
      </div>
      {canEdit && <Button variant="secondary" onClick={onEdit}>Ir a editar ficha</Button>}
    </div>
  )
}

export function ProspectMembershipReference({ prospect }) {
  return (
    <details className="rounded-lg border border-slate-200 bg-white">
      <summary className="cursor-pointer px-4 py-3 text-sm font-medium text-slate-600">
        Ver referencia de captación
      </summary>
      <div className="flex flex-wrap gap-8 border-t border-slate-100 px-4 py-3 text-sm text-slate-600">
        <p>
          <span className="block text-xs font-medium text-slate-400">Tarifa sugerida</span>
          {prospect.suggested_fee ? formatCurrency(prospect.suggested_fee) : '—'}
        </p>
        <p>
          <span className="block text-xs font-medium text-slate-400">Categoría sugerida</span>
          {prospect.current_category?.name || '—'}
        </p>
      </div>
    </details>
  )
}
