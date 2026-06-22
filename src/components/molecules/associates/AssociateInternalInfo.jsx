import { Badge } from '../../atoms/Badge'
import { ASSOCIATE_STATUS_VARIANT } from '../../../utils/associateConstants'
import { InfoRow, InfoSection } from './AssociateInfoPrimitives'

export function AssociateInternalInfo({ associate }) {
  const statusCode = associate.associate_status?.code
  const statusLabel = associate.associate_status?.label || '—'

  return (
    <InfoSection title="Información interna">
      <InfoRow label="Código" value={associate.internal_code} />
      <InfoRow label="Libro / Padrón" value={associate.book_registry} />
      <InfoRow label="Estado">
        <Badge variant={ASSOCIATE_STATUS_VARIANT[statusCode] || 'default'}>{statusLabel}</Badge>
      </InfoRow>
      <InfoRow label="Bienvenida" value={associate.welcome_status ? 'Sí' : 'No'} />
      <InfoRow label="Responsable afiliación" value={formatUser(associate.affiliation_responsible)} />
      <InfoRow label="Categoría" value={associate.category?.name} />
      {associate.captador && <InfoRow label="Captador" value={associate.captador.full_name} />}
    </InfoSection>
  )
}

function formatUser(user) {
  return user ? [user.first_name, user.last_name].filter(Boolean).join(' ') : null
}
