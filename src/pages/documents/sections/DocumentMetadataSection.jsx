import { Link } from 'react-router-dom'
import { Badge } from '../../../components/atoms/Badge'
import { formatFileSize } from '../../../utils/documentConstants'
import { formatDateTime } from '../../../utils/helpers'
import { ROUTES } from '../../../router/routes'

export function DocumentMetadataSection({ document }) {
  const associateUrl = document.associate
    ? ROUTES.ASOCIADOS_DETALLE.replace(':id', document.associate.id)
    : null
  const prospectUrl = document.prospect
    ? ROUTES.PROSPECTOS_DETALLE.replace(':id', document.prospect.id)
    : null

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h2 className="text-sm font-bold text-slate-700 mb-4">
        Metadatos
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetadataItem label="Tipo documental">
          {document.document_type?.label || '—'}
        </MetadataItem>
        <MetadataItem label="Categoría">
          {document.document_category?.label || '—'}
        </MetadataItem>
        <MetadataItem label="Asociado vinculado">
          {document.associate ? (
            <Link className="text-blue-600 hover:underline" to={associateUrl}>
              {document.associate.company_name}
            </Link>
          ) : '—'}
        </MetadataItem>
        <MetadataItem label="Prospecto vinculado">
          {document.prospect ? (
            <Link className="text-blue-600 hover:underline" to={prospectUrl}>
              {document.prospect.company_name}
            </Link>
          ) : '—'}
        </MetadataItem>
        <MetadataItem label="Nodo lógico">
          {document.storage_node?.name || '—'}
        </MetadataItem>
        <MetadataItem label="Ruta lógica">
          {getLogicalPath(document)}
        </MetadataItem>
        <MetadataItem label="Bucket">
          {document.storage_bucket}
        </MetadataItem>
        <MetadataItem label="Storage path">
          <span className="break-all font-mono text-xs">
            {document.storage_path}
          </span>
        </MetadataItem>
        <MetadataItem label="MIME type">
          {document.mime_type || '—'}
        </MetadataItem>
        <MetadataItem label="Extensión">
          {document.file_extension ? `.${document.file_extension}` : '—'}
        </MetadataItem>
        <MetadataItem label="Tamaño">
          {formatFileSize(document.size_bytes)}
        </MetadataItem>
        <MetadataItem label="Subido el">
          {formatDateTime(document.uploaded_at)}
        </MetadataItem>
        <MetadataItem label="Usuario que subió">
          {document.uploaded_by_user_id || '—'}
        </MetadataItem>
        <MetadataItem label="Estado">
          <Badge variant={document.is_latest_version ? 'success' : 'warning'}>
            {document.is_latest_version ? 'Versión vigente' : 'Versión histórica'}
          </Badge>
        </MetadataItem>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-500 mb-1">Notas</p>
        <p className="text-sm text-slate-700 whitespace-pre-wrap">
          {document.notes || '—'}
        </p>
      </div>
    </div>
  )
}

function MetadataItem({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-500 mb-1">{label}</p>
      <div className="text-sm text-slate-800">{children}</div>
    </div>
  )
}

function getLogicalPath(document) {
  if (document.storage_node?.slug) return document.storage_node.slug
  if (document.associate) return `asociados/${document.associate.internal_code}`
  if (document.prospect) return `prospectos/${document.prospect.ruc || document.prospect.id}`
  return 'general'
}
