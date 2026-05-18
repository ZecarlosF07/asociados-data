import { Button } from '../../atoms/Button'
import { Modal } from '../../organisms/Modal'
import {
  formatAuditAction,
  formatAuditActor,
  formatAuditDate,
  formatAuditEntity,
  formatAuditSubject,
} from '../../../utils/auditFormatters'
import { AuditChangeSummary } from './AuditChangeSummary'
import { AuditJsonViewer } from './AuditJsonViewer'

export function AuditLogDetailModal({ log, onClose }) {
  if (!log) return null

  return (
    <Modal
      isOpen={!!log}
      onClose={onClose}
      title="Detalle de auditoría"
      size="lg"
      footer={<Button variant="secondary" onClick={onClose}>Cerrar</Button>}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <Info label="Fecha" value={formatAuditDate(log.event_at)} />
          <Info label="Usuario" value={formatAuditActor(log)} />
          <Info label="Entidad" value={formatAuditEntity(log.entity_name)} />
          <Info label="Acción" value={formatAuditAction(log.action_type)} />
          <Info label="Registro afectado" value={formatAuditSubject(log)} />
          <Info label="Evento ID" value={log.id} />
        </div>

        {log.summary && (
          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-1">Resumen</h4>
            <p className="text-sm text-slate-600">{log.summary}</p>
          </div>
        )}

        <section>
          <h4 className="text-xs font-bold text-slate-700 mb-2">
            Campos modificados
          </h4>
          <AuditChangeSummary
            previousData={log.previous_data}
            newData={log.new_data}
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AuditJsonViewer title="Datos anteriores" value={log.previous_data} />
          <AuditJsonViewer title="Datos nuevos" value={log.new_data} />
        </div>

        <AuditJsonViewer title="Metadatos" value={log.extra_meta} />
      </div>
    </Modal>
  )
}

function Info({ label, value }) {
  return (
    <div className="min-w-0 rounded-md bg-slate-50 px-3 py-2">
      <p className="font-medium text-slate-500">{label}</p>
      <p className="text-slate-800 truncate">{value || '—'}</p>
    </div>
  )
}
