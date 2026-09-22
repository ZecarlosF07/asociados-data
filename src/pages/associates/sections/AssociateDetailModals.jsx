import { AssociateCommitteeModal } from '../../../components/molecules/associates/AssociateCommitteeModal'
import { AssociateOffboardingModal } from '../../../components/molecules/associates/AssociateOffboardingModal'
import { getOffboardingImpact } from '../../../utils/associateOffboarding'

export function AssociateDetailModals({ committeeActions, offboarding, detail, canUpdateMembership }) {
  return (
    <>
      <AssociateCommitteeModal
        isOpen={!!committeeActions.mode}
        mode={committeeActions.mode}
        loading={committeeActions.loading}
        onClose={committeeActions.close}
        onSubmit={committeeActions.submit}
      />
      <AssociateOffboardingModal
        isOpen={offboarding.modalOpen}
        associate={detail.associate}
        impact={getOffboardingImpact(detail.associate, detail.memberships, detail.schedules)}
        loading={offboarding.loading}
        canManageMembership={canUpdateMembership}
        onClose={offboarding.close}
        onConfirm={(reason) => offboarding.confirm(
          detail.associate.is_offboarded, reason, detail.associate.associate_status?.code
        )}
      />
    </>
  )
}
