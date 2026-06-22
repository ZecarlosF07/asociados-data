import { Badge } from '../../../components/atoms/Badge'
import { Button } from '../../../components/atoms/Button'
import { ASSOCIATE_STATUS_VARIANT } from '../../../utils/associateConstants'

export function AssociateDetailHeader({
  associate,
  canEdit,
  committeeActionLoading,
  onEdit,
  onBack,
  onManageCommittee,
}) {
  const statusCode = associate.associate_status?.code
  const statusLabel = associate.associate_status?.label || '—'
  const variant = ASSOCIATE_STATUS_VARIANT[statusCode] || 'default'

  return (
    <div className="mb-6">
      <button
        className="text-xs text-slate-400 hover:text-slate-600 mb-3 inline-flex items-center gap-1"
        onClick={onBack}
      >
        ← Volver al listado
      </button>

      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">
              {associate.company_name}
            </h1>
            <Badge variant={variant}>{statusLabel}</Badge>
          </div>
          <p className="text-sm text-slate-400">
            {associate.internal_code}
            {associate.ruc && ` · RUC: ${associate.ruc}`}
            {associate.trade_name && ` · ${associate.trade_name}`}
          </p>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            <Button size="sm" onClick={onEdit}>
              Editar ficha
            </Button>
          </div>
        )}
      </div>

      <CommitteeSummary
        committee={associate.primary_committee}
        canEdit={canEdit}
        loading={committeeActionLoading}
        onManage={onManageCommittee}
      />
    </div>
  )
}

function CommitteeSummary({ committee, canEdit, loading, onManage }) {
  return (
    <div className={`mt-4 flex flex-wrap items-center gap-2 rounded-lg border px-4 py-3 ${committee ? 'border-blue-100 bg-blue-50/70' : 'border-amber-200 bg-amber-50'}`}>
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Comité principal
      </span>
      {committee ? (
        <span className="text-sm font-semibold text-blue-900">
          {committee.code ? `${committee.code} · ` : ''}{committee.name}
        </span>
      ) : (
        <span className="text-sm font-medium text-amber-800">Sin comité asignado</span>
      )}
      {canEdit && (
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="secondary" disabled={loading} onClick={() => onManage(committee ? 'change' : 'assign')}>
            {committee ? 'Cambiar comité' : 'Asignar comité'}
          </Button>
          {committee && (
            <Button size="sm" variant="ghost" disabled={loading} onClick={() => onManage('remove')}>
              Retirar
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
