import { useState } from 'react'
import { Button } from '../../../components/atoms/Button'
import { DocumentList } from '../../../components/molecules/documents/DocumentList'
import { DocumentUploadForm } from '../../../components/molecules/documents/DocumentUploadForm'

export function AssociateDocumentsTab({ actionLoading, associateId, canEdit, documents, onDelete, onDownload, onUpload, onView }) {
  const [uploadOpen, setUploadOpen] = useState(false)

  const upload = async (data) => {
    await onUpload(data)
    setUploadOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">Documentos ({documents.length})</h3>
        {canEdit && !uploadOpen && <Button size="sm" onClick={() => setUploadOpen(true)}>+ Subir documento</Button>}
      </div>
      {uploadOpen && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <DocumentUploadForm
            associateId={associateId}
            onSubmit={upload}
            onCancel={() => setUploadOpen(false)}
            loading={actionLoading}
          />
        </div>
      )}
      <DocumentList documents={documents} canEdit={canEdit} onView={onView} onDownload={onDownload} onDelete={onDelete} />
    </div>
  )
}
