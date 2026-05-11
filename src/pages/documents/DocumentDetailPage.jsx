import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useNotification } from '../../hooks/useNotification'
import { useUserProfile } from '../../hooks/useUserProfile'
import { usePermissions } from '../../hooks/usePermissions'
import { documentsService } from '../../services/documents.service'
import { DocumentUploadForm } from '../../components/molecules/documents/DocumentUploadForm'
import { FormField } from '../../components/molecules/FormField'
import { CatalogSelect } from '../../components/molecules/CatalogSelect'
import { Button } from '../../components/atoms/Button'
import { Loader } from '../../components/atoms/Loader'
import { Textarea } from '../../components/atoms/Textarea'
import { DOCUMENT_CATALOG_GROUPS } from '../../utils/documentConstants'
import { validateDocumentMetadata } from '../../utils/documentValidation'
import { ROUTES } from '../../router/routes'
import { DocumentDetailHeader } from './sections/DocumentDetailHeader'
import { DocumentMetadataSection } from './sections/DocumentMetadataSection'
import { DocumentVersionSection } from './sections/DocumentVersionSection'

export function DocumentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { profile } = useUserProfile()
  const { canEdit, canDelete } = usePermissions()
  const [document, setDocument] = useState(null)
  const [versions, setVersions] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState(null)

  const fetchDocument = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [documentData, versionData] = await Promise.all([
        documentsService.getById(id),
        documentsService.getVersionHistory(id),
      ])

      setDocument(documentData)
      setVersions(versionData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchDocument()
  }, [fetchDocument])

  const handleDownload = async () => {
    try {
      const url = await documentsService.getSignedUrl(document.storage_path)
      if (url) window.open(url, '_blank')
    } catch (err) {
      notify.error('Error al descargar: ' + err.message)
    }
  }

  const handleCopyReference = async () => {
    const reference = `${document.storage_bucket}/${document.storage_path}`

    try {
      await navigator.clipboard.writeText(reference)
      notify.success('Referencia copiada')
    } catch {
      notify.error('No se pudo copiar la referencia')
    }
  }

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar "${document.title}"?`)) return

    setActionLoading(true)
    try {
      await documentsService.softDelete(document.id, profile?.id)
      notify.success('Documento eliminado')
      navigate(ROUTES.DOCUMENTOS)
    } catch (err) {
      notify.error('Error: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleMetadataSubmit = async (updates) => {
    setActionLoading(true)
    try {
      const updated = await documentsService.updateMetadata(document.id, {
        ...updates,
        updated_by: profile?.id,
      })
      notify.success('Metadatos actualizados')
      setDocument(updated)
      setMode(null)
      fetchDocument()
    } catch (err) {
      notify.error('Error: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReplaceVersion = async ({ file, metadata }) => {
    setActionLoading(true)
    try {
      const replacement = await documentsService.replaceVersion({
        documentId: document.id,
        file,
        metadata,
        userId: profile?.id,
      })
      notify.success('Nueva versión registrada')
      navigate(ROUTES.DOCUMENTOS_DETALLE.replace(':id', replacement.id))
    } catch (err) {
      notify.error('Error: ' + err.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader />
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="max-w-3xl text-center py-24">
        <p className="text-slate-400 mb-4">
          {error || 'Documento no encontrado'}
        </p>
        <button
          className="text-blue-500 text-sm underline"
          onClick={() => navigate(ROUTES.DOCUMENTOS)}
        >
          Volver al listado
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl">
      <DocumentDetailHeader
        document={document}
        canEdit={canEdit}
        canDelete={canDelete}
        onBack={() => navigate(ROUTES.DOCUMENTOS)}
        onDownload={handleDownload}
        onCopyReference={handleCopyReference}
        onEdit={() => setMode(mode === 'edit' ? null : 'edit')}
        onReplace={() => setMode(mode === 'replace' ? null : 'replace')}
        onDelete={handleDelete}
      />

      {mode === 'edit' && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <DocumentMetadataForm
            document={document}
            loading={actionLoading}
            onSubmit={handleMetadataSubmit}
            onCancel={() => setMode(null)}
          />
        </div>
      )}

      {mode === 'replace' && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
          <DocumentUploadForm
            initialData={document}
            submitLabel="Registrar nueva versión"
            onSubmit={handleReplaceVersion}
            onCancel={() => setMode(null)}
            loading={actionLoading}
          />
        </div>
      )}

      <div className="space-y-6">
        <DocumentMetadataSection document={document} />
        <DocumentVersionSection document={document} versions={versions} />
      </div>
    </div>
  )
}

function DocumentMetadataForm({ document, loading, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: document.title || '',
    document_type_id: document.document_type_id || '',
    document_category_id: document.document_category_id || '',
    notes: document.notes || '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const validationErrors = validateDocumentMetadata(form)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    onSubmit(Object.fromEntries(
      Object.entries(form).map(([key, value]) => [key, value === '' ? null : value])
    ))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Título"
          name="title"
          required
          value={form.title}
          onChange={handleChange}
          error={errors.title}
        />

        <FormField label="Tipo de documento" name="document_type_id">
          <CatalogSelect
            groupCode={DOCUMENT_CATALOG_GROUPS.DOCUMENT_TYPE}
            value={form.document_type_id}
            onChange={handleChange}
            name="document_type_id"
            placeholder="Seleccionar tipo..."
          />
        </FormField>

        <FormField label="Categoría" name="document_category_id">
          <CatalogSelect
            groupCode={DOCUMENT_CATALOG_GROUPS.DOCUMENT_CATEGORY}
            value={form.document_category_id}
            onChange={handleChange}
            name="document_category_id"
            placeholder="Seleccionar categoría..."
          />
        </FormField>
      </div>

      <FormField label="Notas" name="notes">
        <Textarea
          name="notes"
          value={form.notes || ''}
          onChange={handleChange}
          placeholder="Observaciones del documento..."
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <Button variant="secondary" type="button" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={loading}>
          Guardar metadatos
        </Button>
      </div>
    </form>
  )
}
