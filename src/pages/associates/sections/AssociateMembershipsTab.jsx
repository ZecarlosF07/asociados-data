import { useState } from 'react'
import { Button } from '../../../components/atoms/Button'
import { EmptyState } from '../../../components/atoms/EmptyState'
import { MembershipForm } from '../../../components/molecules/financial/MembershipForm'
import { MembershipList } from '../../../components/molecules/financial/MembershipList'
import { MembershipCategoryWarning, ProspectMembershipReference } from './MembershipContextCards'

export function AssociateMembershipsTab(props) {
  const { actionLoading, associate, canCreate, canUpdate, memberships } = props
  const [formOpen, setFormOpen] = useState(false)
  const [renewingFrom, setRenewingFrom] = useState(null)
  const currentMembership = memberships.find(
    (membership) => membership.membership_status?.code === 'VIGENTE'
  )
  const scheduledMembership = memberships.find(
    (membership) => membership.membership_status?.code === 'PROGRAMADA'
  )
  const history = memberships.filter(
    (membership) => !['VIGENTE', 'PROGRAMADA'].includes(membership.membership_status?.code)
  )
  const closeForm = () => { setRenewingFrom(null); setFormOpen(false) }
  const openRenewal = (membership) => { setRenewingFrom(membership); setFormOpen(true) }
  const save = async (data) => {
    const succeeded = renewingFrom
      ? await props.onRenew(renewingFrom.id, data)
      : await props.onSubmit(data)
    if (succeeded) closeForm()
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">Gestión de membresía</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">
            {currentMembership
              ? scheduledMembership
                ? 'Consulta el periodo vigente y la próxima renovación programada.'
                : 'Consulta el periodo vigente o programa una renovación. Los periodos anteriores se conservan.'
              : 'Registra un nuevo periodo anual para el asociado.'}
          </p>
        </div>
        {canCreate && !currentMembership && !scheduledMembership && !formOpen && associate.category && (
          <Button onClick={() => setFormOpen(true)}>Crear membresía</Button>
        )}
      </header>

      {associate.prospect_origin && <ProspectMembershipReference prospect={associate.prospect_origin} />}
      {!associate.category && !currentMembership && (
        <MembershipCategoryWarning canEdit={props.canEditAssociate} onEdit={props.onEditAssociate} />
      )}

      {formOpen ? (
        <MembershipFormPanel renewing={!!renewingFrom}>
          <MembershipForm initialData={renewingFrom ? renewalData(renewingFrom) : null}
            associateCategory={associate.category} mode={renewingFrom ? 'renew' : 'create'}
            onSubmit={save} onCancel={closeForm} loading={actionLoading} />
        </MembershipFormPanel>
      ) : (
        <>
          <MembershipList currentMembership={currentMembership}
            scheduledMembership={scheduledMembership} history={history}
            canRenew={canCreate && canUpdate} canCancel={canUpdate}
            onCancel={props.onCancel} onCancelScheduled={props.onCancelScheduled}
            onRenew={openRenewal} />
          {!currentMembership && !scheduledMembership && associate.category && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50">
              <EmptyState icon="◎" title="No hay una membresía vigente"
                description={history.length
                  ? 'Los periodos anteriores están en el historial. Crea una membresía para iniciar un nuevo periodo.'
                  : 'Crea la primera membresía para generar su cronograma de pagos.'}
                action={canCreate ? <Button onClick={() => setFormOpen(true)}>Crear membresía</Button> : null} />
            </div>
          )}
        </>
      )}
    </div>
  )
}

function MembershipFormPanel({ renewing, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
        <h3 className="text-base font-bold text-slate-900">
          {renewing ? 'Renovar membresía' : 'Crear membresía'}
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          {renewing
            ? 'Al confirmar, la membresía actual pasará al historial y sus pagos permanecerán intactos.'
            : 'Completa los datos del nuevo periodo. La categoría se toma automáticamente.'}
        </p>
      </div>
      <div className="p-5">{children}</div>
    </section>
  )
}

function renewalData(membership) {
  return {
    membership_type_id: membership.membership_type_id,
    fee_amount: membership.fee_amount,
    monthly_billing_day: membership.monthly_billing_day,
  }
}
