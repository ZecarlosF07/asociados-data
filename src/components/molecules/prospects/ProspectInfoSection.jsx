import { formatCurrency, formatDate } from '../../../utils/helpers'

export function ProspectInfoSection({ prospect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
      <InfoRow label="Razón social" value={prospect.company_name} />
      <InfoRow label="Nombre comercial" value={prospect.trade_name} />
      <InfoRow label="RUC" value={prospect.ruc} />
      <InfoRow label="Actividad económica" value={prospect.economic_activity} />
      <InfoRow label="Tipo de actividad" value={prospect.activity_type?.label} />
      <InfoRow label="Tamaño de empresa" value={prospect.company_size?.label} />
      <InfoRow label="Contacto" value={prospect.contact_name} />
      <InfoRow label="Cargo" value={prospect.contact_position} />
      <InfoRow label="Correo" value={prospect.primary_email} />
      <InfoRow label="Teléfono" value={prospect.contact_phone} />
      <InfoRow label="Categoría" value={prospect.current_category?.name} />
      <InfoRow label="Tarifa sugerida" value={formatCurrency(prospect.suggested_fee)} />
      <InfoRow label="Tarifa negociada" value={formatCurrency(prospect.negotiated_fee)} />
      <InfoRow label="Procedencia" value={prospect.source} />
      <InfoRow
        label="Captador"
        value={
          prospect.captured_by
            ? `${prospect.captured_by.first_name} ${prospect.captured_by.last_name}`
            : null
        }
      />
      <InfoRow label="Fecha de registro" value={formatDate(prospect.created_at)} />

      {prospect.notes && (
        <div className="col-span-full">
          <InfoRow label="Observaciones" value={prospect.notes} />
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-[0.7rem] font-semibold text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-slate-800">{value || '—'}</span>
    </div>
  )
}
