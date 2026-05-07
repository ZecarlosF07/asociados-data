import { Badge } from '../../atoms/Badge'
import { formatDate } from '../../../utils/helpers'
import {
  ASSOCIATE_STATUS_VARIANT,
  PAYMENT_HEALTH_VARIANT,
} from '../../../utils/associateConstants'

export function AssociateInfoSection({ associate }) {
  const statusCode = associate.associate_status?.code
  const statusLabel = associate.associate_status?.label || '—'
  const statusVariant = ASSOCIATE_STATUS_VARIANT[statusCode] || 'default'

  const healthCode = associate.payment_health?.code
  const healthVariant = PAYMENT_HEALTH_VARIANT[healthCode] || 'default'

  return (
    <div className="space-y-6">
      <Section title="Información interna">
        <Row label="Código" value={associate.internal_code} />
        <Row label="Libro / Padrón" value={associate.book_registry} />
        <Row label="Estado">
          <Badge variant={statusVariant}>{statusLabel}</Badge>
        </Row>
        <Row
          label="Bienvenida"
          value={associate.welcome_status ? 'Sí' : 'No'}
        />
        <Row
          label="Responsable afiliación"
          value={
            associate.affiliation_responsible
              ? `${associate.affiliation_responsible.first_name} ${associate.affiliation_responsible.last_name}`
              : null
          }
        />
        <Row label="Categoría" value={associate.category?.name} />
        {associate.captador && (
          <Row label="Captador" value={associate.captador.full_name} />
        )}
      </Section>

      <Section title="Datos de la empresa">
        <Row label="RUC" value={associate.ruc} />
        <Row label="Razón social" value={associate.company_name} />
        <Row label="Nombre comercial" value={associate.trade_name} />
        <Row label="Dirección" value={associate.address} />
        <Row label="Actividad económica" value={associate.economic_activity} />
        <Row
          label="Tipo de actividad"
          value={associate.activity_type?.label}
        />
        <Row label="Tamaño" value={associate.company_size?.label} />
        <Row label="Página web" value={associate.website} />
      </Section>

      <Section title="Contacto">
        <Row label="Teléfono fijo" value={associate.landline_phone} />
        <Row label="Celular 1" value={associate.mobile_phone_1} />
        <Row label="Celular 2" value={associate.mobile_phone_2} />
        <Row label="Correo corporativo" value={associate.corporate_email} />
      </Section>

      <Section title="Fechas e indicadores">
        <Row
          label="Fecha de asociación"
          value={formatDate(associate.association_date)}
        />
        <Row
          label="Aniversario"
          value={formatDate(associate.anniversary_date)}
        />
        <Row
          label="Última interacción"
          value={formatDate(associate.last_interaction_at)}
        />
        {associate.compliance_percentage != null && (
          <Row
            label="Cumplimiento"
            value={`${associate.compliance_percentage}%`}
          />
        )}
        {associate.payment_health && (
          <Row label="Salud de pago">
            <Badge variant={healthVariant}>
              {associate.payment_health.label}
            </Badge>
          </Row>
        )}
      </Section>

      {associate.notes && (
        <Section title="Observaciones">
          <p className="text-sm text-slate-600 whitespace-pre-line">
            {associate.notes}
          </p>
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="text-sm font-bold text-slate-700 pb-1 mb-3 border-b border-slate-100">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
        {children}
      </div>
    </div>
  )
}

function Row({ label, value, children }) {
  const display = children || value || '—'
  return (
    <div className="flex items-baseline gap-2 text-sm">
      <span className="font-medium text-slate-500 min-w-[140px]">
        {label}:
      </span>
      <span className="text-slate-800">{display}</span>
    </div>
  )
}
