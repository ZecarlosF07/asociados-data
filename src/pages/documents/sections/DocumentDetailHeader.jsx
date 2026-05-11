import { Button } from '../../../components/atoms/Button'
import { Badge } from '../../../components/atoms/Badge'
import { getFileIcon } from '../../../utils/documentConstants'

export function DocumentDetailHeader({
  document,
  canEdit,
  canDelete,
  onBack,
  onDownload,
  onCopyReference,
  onEdit,
  onReplace,
  onDelete,
}) {
  const icon = getFileIcon(document.file_extension)

  return (
    <div className="flex flex-col gap-4 mb-6">
      <button
        type="button"
        className="text-sm text-slate-500 hover:text-slate-800 self-start"
        onClick={onBack}
      >
        ← Volver a documentos
      </button>

      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-3xl shrink-0">{icon}</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900 break-words">
                {document.title}
              </h1>
              <Badge variant={document.is_latest_version ? 'success' : 'warning'}>
                v{document.version_number}
              </Badge>
            </div>
            <p className="text-sm text-slate-400 break-all">
              {document.original_filename}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={onDownload}>
            Descargar
          </Button>
          <Button variant="secondary" size="sm" onClick={onCopyReference}>
            Copiar referencia
          </Button>
          {canEdit && (
            <>
              <Button variant="secondary" size="sm" onClick={onEdit}>
                Editar metadatos
              </Button>
              <Button variant="secondary" size="sm" onClick={onReplace}>
                Reemplazar versión
              </Button>
            </>
          )}
          {canDelete && (
            <Button variant="danger" size="sm" onClick={onDelete}>
              Eliminar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
