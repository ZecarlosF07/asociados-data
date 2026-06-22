import { InfoRow, InfoSection } from './AssociateInfoPrimitives'

export function AssociateCompanyInfo({ associate }) {
  return (
    <InfoSection title="Datos de la empresa">
      <InfoRow label="RUC" value={associate.ruc} />
      <InfoRow label="Razón social" value={associate.company_name} />
      <InfoRow label="Nombre comercial" value={associate.trade_name} />
      <InfoRow label="Dirección" value={associate.address} />
      <InfoRow label="Actividad económica" value={associate.economic_activity} />
      <InfoRow label="Tipo de actividad" value={associate.activity_type?.label} />
      <InfoRow label="Tamaño" value={associate.company_size?.label} />
      <InfoRow label="Página web" value={associate.website} />
    </InfoSection>
  )
}

export function AssociateContactInfo({ associate }) {
  return (
    <InfoSection title="Contacto">
      <InfoRow label="Teléfono fijo" value={associate.landline_phone} />
      <InfoRow label="Celular 1" value={associate.mobile_phone_1} />
      <InfoRow label="Celular 2" value={associate.mobile_phone_2} />
      <InfoRow label="Correo corporativo" value={associate.corporate_email} />
    </InfoSection>
  )
}
