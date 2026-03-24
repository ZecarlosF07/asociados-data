import { useState, useCallback } from 'react'
import { useDocuments } from '../../hooks/useDocuments'
import { useNotification } from '../../hooks/useNotification'
import { useUserProfile } from '../../hooks/useUserProfile'
import { usePermissions } from '../../hooks/usePermissions'
import { documentsService } from '../../services/documents.service'
import { DocumentFilters } from '../../components/molecules/documents/DocumentFilters'
import { DocumentList } from '../../components/molecules/documents/DocumentList'
import { DocumentUploadForm } from '../../components/molecules/documents/DocumentUploadForm'
import { Button } from '../../components/atoms/Button'
import { Loader } from '../../components/atoms/Loader'

export function DocumentsPage() {
  const { notify } = useNotification()
  const { profile } = useUserProfile()
  const { canEdit } = usePermissions()
  const [filters, setFilters] = useState({})
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const { documents, loading, refetch } = useDocuments(filters)

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters)
  }, [])

  const handleUpload = async ({ file, metadata }) => {
    setActionLoading(true)
    try {
      await documentsService.upload({
        file,
        metadata,
        userId: profile?.id,
      })
      notify.success('Documento subido correctamente')
      setShowUploadForm(false)
      refetch()
    } catch (error) {
      notify.error('Error al subir: ' + error.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleDownload = async (document) => {
    try {
      const url = await documentsService.getSignedUrl(document.storage_path)
      if (url) window.open(url, '_blank')
    } catch (error) {
      notify.error('Error al descargar: ' + error.message)
    }
  }

  const handleDelete = async (document) => {
    if (!confirm(`¿Eliminar "${document.title}"?`)) return
    try {
      await documentsService.softDelete(document.id, profile?.id)
      notify.success('Documento eliminado')
      refetch()
    } catch (error) {
      notify.error('Error: ' + error.message)
    }
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Documentos</h1>
          <p className="text-sm text-slate-400">
            Repositorio documental del sistema
          </p>
        </div>
        {canEdit && !showUploadForm && (
          <Button size="sm" onClick={() => setShowUploadForm(true)}>
            + Subir documento
          </Button>
        )}
      </div>

      {showUploadForm && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <DocumentUploadForm
            onSubmit={handleUpload}
            onCancel={() => setShowUploadForm(false)}
            loading={actionLoading}
          />
        </div>
      )}

      <div className="mb-6">
        <DocumentFilters onFilterChange={handleFilterChange} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader />
        </div>
      ) : (
        <DocumentList
          documents={documents}
          canEdit={canEdit}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      )}
    </div>
  )
}
