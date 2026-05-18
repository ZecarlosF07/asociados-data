import { Button } from '../../atoms/Button'
import { Input } from '../../atoms/Input'
import { AUDIT_ACTION_OPTIONS, AUDIT_ENTITY_OPTIONS } from '../../../utils/auditFormatters'
import { AuditUserSelect } from './AuditUserSelect'

export function AuditFilters({ filters, onFilterChange, onClear }) {
  const hasActiveFilters = Object.values(filters).some(Boolean)

  return (
    <div className="flex flex-wrap items-end gap-3 mb-5">
      <Field label="Usuario" className="w-full sm:w-64">
        <AuditUserSelect
          value={filters.actorUserId}
          onChange={(e) => onFilterChange({ actorUserId: e.target.value })}
        />
      </Field>

      <Field label="Entidad" className="w-full sm:w-52">
        <select
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          value={filters.entityName}
          onChange={(e) => onFilterChange({ entityName: e.target.value })}
        >
          <option value="">Todas</option>
          {AUDIT_ENTITY_OPTIONS.map((entity) => (
            <option key={entity} value={entity}>{entity}</option>
          ))}
        </select>
      </Field>

      <Field label="Acción" className="w-full sm:w-52">
        <select
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 bg-white outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          value={filters.actionType}
          onChange={(e) => onFilterChange({ actionType: e.target.value })}
        >
          <option value="">Todas</option>
          {AUDIT_ACTION_OPTIONS.map((action) => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>
      </Field>

      <Field label="Desde" className="w-full sm:w-40">
        <Input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onFilterChange({ dateFrom: e.target.value })}
        />
      </Field>

      <Field label="Hasta" className="w-full sm:w-40">
        <Input
          type="date"
          value={filters.dateTo}
          onChange={(e) => onFilterChange({ dateTo: e.target.value })}
        />
      </Field>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onClear}>
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}

function Field({ label, className, children }) {
  return (
    <div className={className}>
      <label className="text-xs font-semibold text-slate-800 mb-1 block">
        {label}
      </label>
      {children}
    </div>
  )
}
