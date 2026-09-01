import { Button } from '../../atoms/Button'
import { MembershipCard } from './MembershipCard'
import { MembershipHistory } from './MembershipHistory'

export function MembershipList({
  currentMembership,
  scheduledMembership,
  history,
  canRenew,
  canCancel,
  onCancel,
  onCancelScheduled,
  onRenew,
}) {
  return (
    <div className="space-y-4">
      {currentMembership && (
        <MembershipCard
          membership={currentMembership}
          eyebrow="Membresía vigente"
          tone="blue"
          footer="La deuda ya vencida se conserva al renovar o cancelar."
          actions={(
            <>
              {canCancel && (
                <Button variant="secondary" onClick={() => onCancel(currentMembership)}>
                  Cancelar membresía
                </Button>
              )}
              {canRenew && !scheduledMembership && (
                <Button onClick={() => onRenew(currentMembership)}>Renovar membresía</Button>
              )}
            </>
          )}
        />
      )}

      {scheduledMembership && (
        <MembershipCard
          membership={scheduledMembership}
          eyebrow="Próxima renovación"
          tone="amber"
          footer="Todavía no genera deuda ni admite pagos. Se activará en su fecha de inicio."
          actions={canCancel ? (
            <Button variant="secondary" onClick={() => onCancelScheduled(scheduledMembership)}>
              Cancelar renovación programada
            </Button>
          ) : null}
        />
      )}

      {history.length > 0 && <MembershipHistory memberships={history} />}
    </div>
  )
}
