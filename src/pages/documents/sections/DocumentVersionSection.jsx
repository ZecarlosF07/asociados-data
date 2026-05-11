import { Badge } from '../../../components/atoms/Badge'
import { formatDateTime } from '../../../utils/helpers'

export function DocumentVersionSection({ document, versions = [] }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h2 className="text-sm font-bold text-slate-700 mb-4">
        Versionamiento
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <VersionMetric label="Versión actual" value={`v${document.version_number}`} />
        <VersionMetric
          label="Reemplaza a"
          value={document.replaces_document?.title || document.replaces_document_id || '—'}
        />
        <VersionMetric
          label="Historial"
          value={`${versions.length} versión${versions.length === 1 ? '' : 'es'}`}
        />
      </div>

      {versions.length === 0 ? (
        <p className="text-sm text-slate-400">
          No hay historial de versiones registrado.
        </p>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <div
              key={version.id}
              className="border border-slate-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-900">
                    v{version.version_number} · {version.title}
                  </p>
                  {version.id === document.id && (
                    <Badge variant="success">Actual</Badge>
                  )}
                  {!version.is_latest_version && (
                    <Badge variant="warning">Histórica</Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400 break-all">
                  {version.original_filename}
                </p>
              </div>

              <div className="text-xs text-slate-500 md:text-right">
                <p>{formatDateTime(version.uploaded_at)}</p>
                <p>
                  {version.uploaded_by_user_id || 'Sin usuario registrado'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function VersionMetric({ label, value }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
      <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-900 break-words">{value}</p>
    </div>
  )
}
