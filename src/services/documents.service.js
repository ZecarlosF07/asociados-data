import { supabase } from '../lib/supabaseClient'

const DOCUMENT_SELECT = `
  *,
  document_category:document_category_id(id, code, label),
  document_type:document_type_id(id, code, label),
  associate:associate_id(id, company_name, ruc, internal_code),
  prospect:prospect_id(id, company_name, ruc),
  storage_node:storage_node_id(id, name, slug)
`

const STORAGE_BUCKET = 'documents'

export const documentsService = {
  /**
   * Lista documentos con filtros opcionales
   */
  async getAll({ search, categoryId, typeId, associateId } = {}) {
    let query = supabase
      .from('documents')
      .select(DOCUMENT_SELECT)
      .eq('is_deleted', false)
      .eq('is_latest_version', true)
      .order('uploaded_at', { ascending: false })

    if (associateId) query = query.eq('associate_id', associateId)
    if (categoryId) query = query.eq('document_category_id', categoryId)
    if (typeId) query = query.eq('document_type_id', typeId)

    if (search) {
      query = query.or(
        `title.ilike.%${search}%,original_filename.ilike.%${search}%`
      )
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  /**
   * Obtiene documentos por asociado
   */
  async getByAssociate(associateId) {
    const { data, error } = await supabase
      .from('documents')
      .select(DOCUMENT_SELECT)
      .eq('associate_id', associateId)
      .eq('is_deleted', false)
      .eq('is_latest_version', true)
      .order('uploaded_at', { ascending: false })

    if (error) throw error
    return data
  },

  /**
   * Obtiene un documento por ID
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('documents')
      .select(DOCUMENT_SELECT)
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Sube un archivo a Supabase Storage y registra los metadatos
   */
  async upload({ file, metadata, userId }) {
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const timestamp = Date.now()
    const safeName = file.name
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .toLowerCase()
    const storagePath = buildStoragePath({ metadata, timestamp, safeName })

    // Subir a Storage
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Registrar metadatos en la tabla documents
    const documentRecord = {
      storage_node_id: metadata.storage_node_id || null,
      associate_id: metadata.associate_id || null,
      prospect_id: metadata.prospect_id || null,
      document_category_id: metadata.document_category_id || null,
      document_type_id: metadata.document_type_id || null,
      title: metadata.title || file.name,
      original_filename: file.name,
      storage_bucket: STORAGE_BUCKET,
      storage_path: storagePath,
      mime_type: file.type || null,
      file_extension: ext || null,
      size_bytes: file.size || null,
      version_number: 1,
      is_latest_version: true,
      uploaded_by_user_id: userId,
      uploaded_at: new Date().toISOString(),
      notes: metadata.notes || null,
      created_by: userId,
    }

    const { data, error: insertError } = await supabase
      .from('documents')
      .insert(documentRecord)
      .select(DOCUMENT_SELECT)
      .single()

    if (insertError) {
      // Limpiar el archivo subido si falla el registro
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath])
      throw insertError
    }

    return data
  },

  /**
   * Actualiza los metadatos de un documento
   */
  async update(id, updates) {
    const { data, error } = await supabase
      .from('documents')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select(DOCUMENT_SELECT)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Reemplaza un documento con una nueva versión
   */
  async replaceVersion({ documentId, file, metadata, userId }) {
    // Marcar el anterior como no más reciente
    await supabase
      .from('documents')
      .update({
        is_latest_version: false,
        updated_at: new Date().toISOString(),
        updated_by: userId,
      })
      .eq('id', documentId)

    // Obtener el documento actual para versión
    const current = await documentsService.getById(documentId)
    const newVersion = (current?.version_number || 1) + 1

    // Subir nuevo archivo
    const uploaded = await documentsService.upload({
      file,
      metadata: {
        ...metadata,
        associate_id: current?.associate_id,
        prospect_id: current?.prospect_id,
        storage_node_id: current?.storage_node_id,
      },
      userId,
    })

    // Actualizar con la referencia de reemplazo y versión
    const { data, error } = await supabase
      .from('documents')
      .update({
        replaces_document_id: documentId,
        version_number: newVersion,
        updated_at: new Date().toISOString(),
      })
      .eq('id', uploaded.id)
      .select(DOCUMENT_SELECT)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Soft delete de un documento
   */
  async softDelete(id, deletedBy) {
    const { error } = await supabase
      .from('documents')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        deleted_by: deletedBy,
      })
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Obtiene la URL pública o firmada del archivo
   */
  async getFileUrl(storagePath) {
    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath)

    return data?.publicUrl || null
  },

  /**
   * Obtiene URL firmada con expiración
   */
  async getSignedUrl(storagePath, expiresIn = 3600) {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresIn)

    if (error) throw error
    return data?.signedUrl || null
  },

  /**
   * Descarga directa del archivo
   */
  async downloadFile(storagePath) {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .download(storagePath)

    if (error) throw error
    return data
  },
}

/**
 * Construye ruta de almacenamiento organizada
 */
function buildStoragePath({ metadata, timestamp, safeName }) {
  const parts = []

  if (metadata.associate_id) {
    parts.push('asociados', metadata.associate_id)
  } else if (metadata.prospect_id) {
    parts.push('prospectos', metadata.prospect_id)
  } else {
    parts.push('general')
  }

  parts.push(`${timestamp}_${safeName}`)
  return parts.join('/')
}
