import { Badge } from '../../atoms/Badge'
import { Button } from '../../atoms/Button'
import { formatFileSize, getFileIcon } from '../../../utils/documentConstants'
import { formatDateTime } from '../../../utils/helpers'

export function DocumentCard({ document, canEdit, onDownload, onDelete }) {
  const ext = document.file_extension || ''
  const icon = getFileIcon(ext)

  return (
    <div className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5 shrink-0">{icon}</span>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-slate-900 truncate">
            {document.title}
          </h4>
          <p className="text-xs text-slate-400 truncate">
            {document.original_filename}
          </p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            {document.document_type && (
              <Badge variant="default" size="sm">
                {document.document_type.label}
              </Badge>
            )}
            {document.document_category && (
              <Badge variant="info" size="sm">
                {document.document_category.label}
              </Badge>
            )}
            {document.size_bytes && (
              <span className="text-xs text-slate-400">
                {formatFileSize(document.size_bytes)}
              </span>
            )}
            {ext && (
              <span className="text-xs text-slate-400 uppercase">
                .{ext}
              </span>
            )}
          </div>

          {document.notes && (
            <p className="text-xs text-slate-500 mt-2 line-clamp-2">
              {document.notes}
            </p>
          )}

          <p className="text-xs text-slate-400 mt-2">
            {formatDateTime(document.uploaded_at)}
            {document.version_number > 1 && (
              <span className="ml-2 text-blue-500">v{document.version_number}</span>
            )}
          </p>
        </div>

        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={() => onDownload(document)}>
            ↓
          </Button>
          {canEdit && (
            <Button variant="ghost" size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={() => onDelete(document)}
            >
              ✕
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
