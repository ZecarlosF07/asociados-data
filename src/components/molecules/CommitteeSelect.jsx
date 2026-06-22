import { useCommittees } from '../../hooks/useCommittees'

export function CommitteeSelect({
  value,
  onChange,
  name = 'committee_id',
  disabled = false,
  placeholder = 'Sin comité',
  showWithoutOption = false,
}) {
  const { committees, loading } = useCommittees({ activeOnly: true })

  return (
    <select
      className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 disabled:bg-slate-50"
      disabled={disabled || loading}
      name={name}
      value={value || ''}
      onChange={onChange}
    >
      <option value="">{placeholder}</option>
      {showWithoutOption && <option value="__WITHOUT__">Sin comité</option>}
      {committees.map((committee) => (
        <option key={committee.id} value={committee.id}>
          {committee.code ? `${committee.code} · ` : ''}{committee.name}
        </option>
      ))}
    </select>
  )
}
