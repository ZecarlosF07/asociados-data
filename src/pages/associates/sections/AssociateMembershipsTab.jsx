import { useState } from 'react'
import { Button } from '../../../components/atoms/Button'
import { MembershipForm } from '../../../components/molecules/financial/MembershipForm'
import { MembershipList } from '../../../components/molecules/financial/MembershipList'
import { ScheduleTable } from '../../../components/molecules/financial/ScheduleTable'
import { formatCurrency } from '../../../utils/helpers'

export function AssociateMembershipsTab(props) {
  const { actionLoading, associate, canEdit, memberships, schedules } = props
  const [formOpen, setFormOpen] = useState(false)
  const [renewingFrom, setRenewingFrom] = useState(null)

  const close = () => { setRenewingFrom(null); setFormOpen(false) }
  const save = async (data) => {
    if (renewingFrom) await props.onRenew(renewingFrom.id, data)
    else await props.onSubmit(data)
    close()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Membresías ({memberships.length})</h3>
        {canEdit && !formOpen && <Button size="sm" onClick={() => setFormOpen(true)}>+ Nueva membresía</Button>}
      </div>
      {associate.prospect_origin && <ProspectReference prospect={associate.prospect_origin} />}
      {formOpen && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <MembershipForm
            initialData={renewingFrom ? renewalData(renewingFrom) : null}
            onSubmit={save}
            onCancel={close}
            loading={actionLoading}
          />
        </div>
      )}
      <MembershipList
        memberships={memberships}
        canEdit={canEdit}
        onDelete={props.onDelete}
        onCancel={props.onCancel}
        onRenew={(membership) => { setRenewingFrom(membership); setFormOpen(true) }}
      />
      {schedules.length > 0 && <ScheduleTable schedules={schedules} />}
    </div>
  )
}

function ProspectReference({ prospect }) {
  return (
    <div className="flex flex-wrap gap-8 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-900">
      <p><span className="block text-xs font-semibold">Tarifa sugerida</span>{prospect.suggested_fee ? formatCurrency(prospect.suggested_fee) : '—'}</p>
      <p><span className="block text-xs font-semibold">Categoría sugerida</span>{prospect.current_category?.name || '—'}</p>
    </div>
  )
}

function renewalData(membership) {
  return {
    membership_type_id: membership.membership_type_id,
    category_id: membership.category_id,
    fee_amount: membership.fee_amount,
    currency_code: membership.currency_code,
    monthly_billing_day: membership.monthly_billing_day,
    membership_status_id: membership.membership_status_id,
    negotiation_notes: '',
    is_current: true,
  }
}
