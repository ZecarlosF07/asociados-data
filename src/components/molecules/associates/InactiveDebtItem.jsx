import { formatCurrency } from '../../../utils/helpers'

export function InactiveDebtItem({ collectibleAmount, overdueAmount }) {
  const collectible = Number(collectibleAmount || 0)
  const overdue = Number(overdueAmount || 0)
  return (
    <div className="min-w-0">
      <p className="font-medium text-slate-500">Saldo cobrable</p>
      <p className={overdue > 0 ? 'font-semibold text-red-700' : 'text-slate-600'}>
        {collectible > 0 ? formatCurrency(collectible) : 'Sin deuda'}
      </p>
      {overdue > 0 && <p className="text-red-700">Vencido: {formatCurrency(overdue)}</p>}
    </div>
  )
}
