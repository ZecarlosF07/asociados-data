import { Badge } from '../../atoms/Badge'
import { Button } from '../../atoms/Button'

export function CommitteeListItem({ committee, canEdit, onEdit, onOpen, onToggle }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <button className="min-w-0 text-left" type="button" onClick={() => onOpen(committee)}>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-sm font-bold text-slate-900">{committee.name}</h3>
          <Badge variant={committee.is_active ? 'success' : 'default'}>
            {committee.is_active ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {committee.code || 'Sin código'}{committee.description ? ` · ${committee.description}` : ''}
        </p>
      </button>
      {canEdit && (
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => onEdit(committee)}>Editar</Button>
          <Button size="sm" variant="ghost" onClick={() => onToggle(committee)}>
            {committee.is_active ? 'Inactivar' : 'Activar'}
          </Button>
        </div>
      )}
    </div>
  )
}
