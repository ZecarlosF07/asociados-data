import { useState } from 'react'
import { DetailSubnav } from '../../../components/molecules/associates/DetailSubnav'
import { AssociateCollectionsTab } from '../../../components/molecules/financial/AssociateCollectionsTab'
import { AssociatePaymentsTab } from '../../../components/molecules/financial/AssociatePaymentsTab'

const OPTIONS = [
  { key: 'payments', label: 'Pagos y cronograma' },
  { key: 'collections', label: 'Gestiones de cobranza' },
]

export function AssociatePaymentsCollectionsSection(props) {
  const [active, setActive] = useState('payments')
  const common = { actionLoading: props.actionLoading, canEdit: props.canEdit }

  return (
    <div>
      <DetailSubnav options={OPTIONS} active={active} onChange={setActive} />
      {active === 'payments' && (
        <AssociatePaymentsTab
          {...common}
          schedules={props.schedules}
          payments={props.payments}
          onPaymentSubmit={props.onPaymentSubmit}
        />
      )}
      {active === 'collections' && (
        <AssociateCollectionsTab
          {...common}
          schedules={props.schedules}
          collectionActions={props.collectionActions}
          onCollectionSubmit={props.onCollectionSubmit}
        />
      )}
    </div>
  )
}
