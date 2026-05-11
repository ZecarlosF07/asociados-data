import { useState, useRef } from 'react'
import { FormField } from '../FormField'
import { Textarea } from '../../atoms/Textarea'
import { CatalogSelect } from '../CatalogSelect'
import { Button } from '../../atoms/Button'
import { DOCUMENT_CATALOG_GROUPS, formatFileSize, getFileIcon } from '../../../utils/documentConstants'
import { validateDocumentUpload } from '../../../utils/documentValidation'

export function DocumentUploadForm({
  associateId,
  initialData,
  submitLabel = 'Subir documento',
  onSubmit,
  onCancel,
  loading,
}) {
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    title: initialData?.title || '',
    document_type_id: initialData?.document_type_id || '',
    document_category_id: initialData?.document_category_id || '',
    notes: initialData?.notes || '',
  })

  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return

    setFile(selected)
    if (!form.title) {
      const nameWithoutExt = selected.name.replace(/\.[^/.]+$/, '')
      setForm((prev) => ({ ...prev, title: nameWithoutExt }))
    }
    if (errors.file) setErrors((prev) => ({ ...prev, file: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validateDocumentUpload(form, file)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    const metadata = {
      ...Object.fromEntries(
        Object.entries(form).map(([k, v]) => [k, v === '' ? null : v])
      ),
      associate_id: associateId || null,
    }

    onSubmit({ file, metadata })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Zona de selección de archivo */}
      <div>
        <label className="text-xs font-semibold text-slate-800">
          Archivo <span className="text-red-500">*</span>
        </label>
        <div
          className={`mt-1 border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            file ? 'border-blue-300 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">{getFileIcon(file.name.split('.').pop())}</span>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-900">{file.name}</p>
                <p className="text-xs text-slate-400">{formatFileSize(file.size)}</p>
              </div>
              <button
                type="button"
                className="text-xs text-red-500 hover:text-red-700 ml-2"
                onClick={(e) => { e.stopPropagation(); setFile(null) }}
              >
                Quitar
              </button>
            </div>
          ) : (
            <div>
              <span className="text-3xl">📁</span>
              <p className="text-sm text-slate-500 mt-2">
                Click para seleccionar archivo
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Máx. 20 MB — PDF, Word, Excel, imágenes, CSV, ZIP
              </p>
            </div>
          )}
        </div>
        {errors.file && <p className="text-xs text-red-500 mt-1">{errors.file}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Título" name="title" required
          value={form.title} onChange={handleChange}
          error={errors.title}
        />

        <FormField label="Tipo de documento" name="document_type_id"
          error={errors.document_type_id}
        >
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
        <Textarea name="notes" value={form.notes}
          onChange={handleChange} placeholder="Observaciones del documento..."
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
        <Button variant="secondary" type="button" size="sm" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" size="sm" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
