import { Badge } from '../../atoms/Badge'
import { formatCurrency, formatDate } from '../../../utils/helpers'
import { MEMBERSHIP_STATUS_VARIANT } from '../../../utils/financialConstants'

const COLUMNS = ['Asociado', 'Tipo', 'Categoría', 'Tarifa', 'Inicio', 'Fin', 'Estado']

export function MembershipTable({ memberships, onMembershipClick }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {COLUMNS.map((column) => (
              <th key={column} className={getHeaderClass(column)}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {memberships.map((membership) => (
            <MembershipRow
              key={membership.id}
              membership={membership}
              onClick={() => onMembershipClick(membership)}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MembershipRow({ membership, onClick }) {
  const statusCode = membership.membership_status?.code
  const statusVariant = MEMBERSHIP_STATUS_VARIANT[statusCode] || 'default'

  return (
    <tr
      className="cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50"
      onClick={onClick}
    >
      <td className="px-4 py-3">
        <div className="font-medium text-slate-900">
          {membership.associate?.company_name || '—'}
        </div>
        <div className="text-xs text-slate-400">
          {membership.associate?.internal_code}
          {membership.associate?.ruc && ` · ${membership.associate.ruc}`}
        </div>
      </td>
      <td className="px-4 py-3 text-slate-600">
        {membership.membership_type?.label || '—'}
      </td>
      <td className="px-4 py-3 text-slate-600">{membership.category?.name || '—'}</td>
      <td className="px-4 py-3 text-right font-medium text-slate-900">
        {formatCurrency(membership.fee_amount)}
      </td>
      <td className="px-4 py-3 text-slate-600">{formatDate(membership.start_date)}</td>
      <td className="px-4 py-3 text-slate-600">
        {formatDate(membership.effective_end_date || membership.end_date)}
      </td>
      <td className="px-4 py-3 text-center">
        <Badge variant={statusVariant}>{membership.membership_status?.label || 'Vigente'}</Badge>
      </td>
    </tr>
  )
}

function getHeaderClass(column) {
  const alignment = column === 'Tarifa'
    ? 'text-right'
    : column === 'Estado'
      ? 'text-center'
      : 'text-left'
  return `${alignment} px-4 py-3 text-xs font-semibold text-slate-500`
}
