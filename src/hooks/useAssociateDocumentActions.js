import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../router/routes'
import { documentsService } from '../services/documents.service'

export function useAssociateDocumentActions({ associateId, notify, profile, refetch }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const upload = async ({ file, metadata }) => run(async () => {
    await documentsService.upload({ file, metadata: { ...metadata, associate_id: associateId }, userId: profile?.id })
    notify.success('Documento subido correctamente')
    refetch()
  }, 'Error al subir: ')

  const download = async (document) => run(async () => {
    const url = await documentsService.getSignedUrl(document.storage_path)
    if (url) window.open(url, '_blank')
  })

  const remove = async (document) => {
    if (!confirm(`¿Eliminar "${document.title}"?`)) return
    await run(async () => {
      await documentsService.softDelete(document.id, profile?.id)
      notify.success('Documento eliminado')
      refetch()
    })
  }

  const view = (document) => navigate(ROUTES.DOCUMENTOS_DETALLE.replace(':id', document.id))

  const run = async (callback, prefix = 'Error: ') => {
    setLoading(true)
    try {
      await callback()
    } catch (error) {
      notify.error(prefix + error.message)
    } finally {
      setLoading(false)
    }
  }

  return { download, loading, remove, upload, view }
}
