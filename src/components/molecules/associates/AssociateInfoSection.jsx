import { AssociateCompanyInfo, AssociateContactInfo } from './AssociateCompanyInfo'
import { AssociateIndicatorsInfo } from './AssociateIndicatorsInfo'
import { AssociateInternalInfo } from './AssociateInternalInfo'
import { InfoSection } from './AssociateInfoPrimitives'

export function AssociateInfoSection({ associate }) {
  return (
    <div className="space-y-6">
      <AssociateInternalInfo associate={associate} />
      <AssociateCompanyInfo associate={associate} />
      <AssociateContactInfo associate={associate} />
      <AssociateIndicatorsInfo associate={associate} />

      {associate.notes && (
        <InfoSection title="Observaciones">
          <p className="text-sm text-slate-600 whitespace-pre-line">
            {associate.notes}
          </p>
        </InfoSection>
      )}
    </div>
  )
}
