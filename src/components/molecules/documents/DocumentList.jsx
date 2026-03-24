import { EmptyState } from '../../atoms/EmptyState'
import { DocumentCard } from './DocumentCard'

export function DocumentList({ documents, canEdit, onDownload, onDelete }) {
  if (!documents?.length) {
    return (
      <EmptyState
        icon="📂"
        title="Sin documentos"
        description="No se encontraron documentos registrados."
      />
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <DocumentCard
          key={doc.id}
          document={doc}
          canEdit={canEdit}
          onDownload={onDownload}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
