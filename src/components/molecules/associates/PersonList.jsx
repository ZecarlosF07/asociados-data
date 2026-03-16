import { Badge } from '../../atoms/Badge'
import { Button } from '../../atoms/Button'
import { formatDate } from '../../../utils/helpers'

export function PersonList({ people, canEdit, onEdit, onDelete }) {
  if (people.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-6">
        No hay personas vinculadas registradas.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {people.map((person) => (
        <div
          key={person.id}
          className="bg-white border border-slate-200 rounded-lg p-4"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  {person.full_name}
                </h4>
                {person.is_primary && (
                  <Badge variant="info">Principal</Badge>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {person.person_role?.label || '—'}
                {person.position && ` · ${person.position}`}
              </p>
            </div>
            {canEdit && (
              <div className="flex gap-1">
                <Button variant="secondary" size="sm" onClick={() => onEdit(person)}>
                  Editar
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onDelete(person)}>
                  Eliminar
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-xs text-slate-500">
            {person.dni && (
              <span>
                <span className="font-medium text-slate-700">DNI:</span>{' '}
                {person.dni}
              </span>
            )}
            {person.email && (
              <span className="truncate">
                <span className="font-medium text-slate-700">Email:</span>{' '}
                {person.email}
              </span>
            )}
            {person.phone && (
              <span>
                <span className="font-medium text-slate-700">Tel:</span>{' '}
                {person.phone}
              </span>
            )}
            {person.birthday && (
              <span>
                <span className="font-medium text-slate-700">Onomástico:</span>{' '}
                {formatDate(person.birthday)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
