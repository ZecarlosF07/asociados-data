import { Badge } from '../../../components/atoms/Badge'
import { Button } from '../../../components/atoms/Button'
import { PROSPECT_STATUS_VARIANT } from '../../../utils/prospectConstants'

export function ProspectDetailHeader({
  prospect,
  canEdit,
  onEdit,
  onStatusChange,
  onConvert,
  onBack,
}) {
  const statusCode = prospect.prospect_status?.code
  const statusLabel = prospect.prospect_status?.label || '—'
  const variant = PROSPECT_STATUS_VARIANT[statusCode] || 'default'
  const canConvert =
    statusCode === 'APROBADO' && !prospect.converted_to_associate_id
  const isConverted = !!prospect.converted_to_associate_id

  return (
    <div className="mb-6">
      <button
        className="text-xs text-slate-400 hover:text-slate-600 transition-colors mb-3 cursor-pointer"
        onClick={onBack}
      >
        ← Volver al listado
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-slate-900">
              {prospect.company_name}
            </h1>
            <Badge variant={variant}>{statusLabel}</Badge>
            {isConverted && (
              <Badge variant="success">Convertido</Badge>
            )}
          </div>
          {prospect.trade_name && (
            <p className="text-sm text-slate-400">{prospect.trade_name}</p>
          )}
          {prospect.ruc && (
            <p className="text-xs text-slate-400 mt-0.5">
              RUC: {prospect.ruc}
            </p>
          )}
        </div>

        {canEdit && (
          <div className="flex gap-2">
            {canConvert && (
              <Button size="sm" onClick={onConvert}>
                Convertir a asociado
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={onStatusChange}>
              Cambiar estado
            </Button>
            <Button variant="secondary" size="sm" onClick={onEdit}>
              Editar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
