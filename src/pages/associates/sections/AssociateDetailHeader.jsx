import { Badge } from '../../../components/atoms/Badge'
import { Button } from '../../../components/atoms/Button'
import { ASSOCIATE_STATUS_VARIANT } from '../../../utils/associateConstants'

export function AssociateDetailHeader({
  associate,
  canEdit,
  onEdit,
  onBack,
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
    </div>
  )
}
