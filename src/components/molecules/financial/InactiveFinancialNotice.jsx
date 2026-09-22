import { formatCurrency } from '../../../utils/helpers'

export function InactiveFinancialNotice({ collectibleAmount, overdueAmount }) {
  const collectible = Number(collectibleAmount || 0)
  const overdue = Number(overdueAmount || 0)

  if (collectible <= 0) {
    return <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">La empresa está inactiva y no tiene deuda cobrable.</p>
  }

  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
      <p className="font-semibold">Deuda histórica cobrable: {formatCurrency(collectible)}</p>
      {overdue > 0 && <p>De ese saldo, {formatCurrency(overdue)} está vencido.</p>}
      <p>La baja o el vencimiento de la membresía no eliminan las cuotas ya devengadas.</p>
    </div>
  )
}
