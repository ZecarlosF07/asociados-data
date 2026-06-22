import { Badge } from '../../atoms/Badge'
import { PAYMENT_HEALTH_VARIANT } from '../../../utils/associateConstants'
import { formatDate } from '../../../utils/helpers'
import { InfoRow, InfoSection } from './AssociateInfoPrimitives'

export function AssociateIndicatorsInfo({ associate }) {
  const healthCode = associate.payment_health?.code
  return (
    <InfoSection title="Fechas e indicadores">
      <InfoRow label="Fecha de asociación" value={formatDate(associate.association_date)} />
      <InfoRow label="Aniversario" value={formatDate(associate.anniversary_date)} />
      <InfoRow label="Última interacción" value={formatDate(associate.last_interaction_at)} />
      {associate.compliance_percentage != null && (
        <InfoRow label="Cumplimiento" value={`${associate.compliance_percentage}%`} />
      )}
      {associate.payment_health && (
        <InfoRow label="Salud de pago">
          <Badge variant={PAYMENT_HEALTH_VARIANT[healthCode] || 'default'}>{associate.payment_health.label}</Badge>
        </InfoRow>
      )}
    </InfoSection>
  )
}
