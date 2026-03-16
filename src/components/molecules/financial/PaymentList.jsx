import { Badge } from '../../atoms/Badge'
import { formatDate, formatCurrency } from '../../../utils/helpers'

export function PaymentList({ payments }) {
  if (payments.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-6">
        No hay pagos registrados.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">
              Fecha
            </th>
            <th className="text-right py-2 px-3 text-xs font-semibold text-slate-500">
              Monto
            </th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">
              Operación
            </th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">
              Método
            </th>
            <th className="text-left py-2 px-3 text-xs font-semibold text-slate-500">
              Registrado por
            </th>
            <th className="text-center py-2 px-3 text-xs font-semibold text-slate-500">
              Estado
            </th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr
              key={p.id}
              className={`border-b border-slate-100 ${
                p.is_reversed ? 'opacity-50 line-through' : ''
              }`}
            >
              <td className="py-2 px-3 text-slate-800">
                {formatDate(p.payment_date)}
              </td>
              <td className="py-2 px-3 text-right text-slate-800 font-medium">
                {formatCurrency(p.amount_paid)}
              </td>
              <td className="py-2 px-3 text-slate-600 font-mono text-xs">
                {p.operation_code}
              </td>
              <td className="py-2 px-3 text-slate-600">
                {p.payment_method?.label || '—'}
              </td>
              <td className="py-2 px-3 text-slate-500 text-xs">
                {p.registered_by
                  ? `${p.registered_by.first_name} ${p.registered_by.last_name}`
                  : '—'}
              </td>
              <td className="py-2 px-3 text-center">
                {p.is_reversed ? (
                  <Badge variant="danger">Reversado</Badge>
                ) : (
                  <Badge variant="success">Válido</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
