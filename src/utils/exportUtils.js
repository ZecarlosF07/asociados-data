import { formatDate } from './helpers'

/**
 * Exporta datos tabulares a un archivo Excel (.xlsx)
 *
 * @param {Object} options
 * @param {string} options.filename - Nombre del archivo (sin extensión)
 * @param {string} options.sheetName - Nombre de la hoja
 * @param {Array<Object>} options.data - Datos a exportar
 * @param {Array<{key: string, label: string, format?: 'date'|'currency'|'number'}>} options.columns - Definición de columnas
 */
export async function exportToExcel({ filename, sheetName, data, columns }) {
  const { XLSX, saveAs } = await loadExcelDependencies()
  const headers = columns.map((c) => c.label)

  const rows = data.map((row) =>
    columns.map((col) => {
      const value = getNestedValue(row, col.key)
      if (col.format === 'date') return formatDate(value)
      if (col.format === 'currency') return value != null ? Number(value) : ''
      if (col.format === 'number') return value != null ? Number(value) : ''
      return value ?? ''
    })
  )

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])

  // Ajustar anchos de columna
  worksheet['!cols'] = columns.map((col) => ({
    wch: Math.max(
      col.label.length + 2,
      ...rows.map((r) => String(r[columns.indexOf(col)] || '').length).slice(0, 50),
      12
    ),
  }))

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName || 'Datos')

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  saveAs(blob, `${filename || 'export'}.xlsx`)
}

/**
 * Exporta múltiples hojas a un mismo archivo Excel
 */
export async function exportMultiSheetExcel({ filename, sheets }) {
  const { XLSX, saveAs } = await loadExcelDependencies()
  const workbook = XLSX.utils.book_new()

  sheets.forEach(({ sheetName, data, columns }) => {
    const headers = columns.map((c) => c.label)
    const rows = data.map((row) =>
      columns.map((col) => {
        const value = getNestedValue(row, col.key)
        if (col.format === 'date') return formatDate(value)
        if (col.format === 'currency') return value != null ? Number(value) : ''
        if (col.format === 'number') return value != null ? Number(value) : ''
        return value ?? ''
      })
    )

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
    worksheet['!cols'] = columns.map((col) => ({
      wch: Math.max(col.label.length + 2, 12),
    }))

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  })

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })

  saveAs(blob, `${filename || 'export'}.xlsx`)
}

async function loadExcelDependencies() {
  const [xlsxModule, fileSaverModule] = await Promise.all([
    import('xlsx'),
    import('file-saver'),
  ])

  return {
    XLSX: xlsxModule,
    saveAs: fileSaverModule.saveAs,
  }
}

/**
 * Accede a valores anidados con notación de punto
 * Ej: getNestedValue(obj, 'category.name')
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, key) => acc?.[key], obj)
}

/**
 * Definiciones de columnas reutilizables para exports
 */
export const EXPORT_COLUMNS = {
  prospects: [
    { key: 'company_name', label: 'Razón social' },
    { key: 'ruc', label: 'RUC' },
    { key: 'prospect_status.label', label: 'Estado' },
    { key: 'category.name', label: 'Categoría' },
    { key: 'captador.full_name', label: 'Captador' },
    { key: 'created_at', label: 'Fecha de registro', format: 'date' },
  ],

  associates: [
    { key: 'internal_code', label: 'Código' },
    { key: 'company_name', label: 'Razón social' },
    { key: 'trade_name', label: 'Nombre comercial' },
    { key: 'ruc', label: 'RUC' },
    { key: 'associate_status.label', label: 'Estado' },
    { key: 'category.name', label: 'Categoría' },
    { key: 'activity_type.label', label: 'Tipo de actividad' },
    { key: 'company_size.label', label: 'Tamaño de empresa' },
    { key: 'corporate_email', label: 'Correo' },
    { key: 'association_date', label: 'Fecha de asociación', format: 'date' },
    { key: 'payment_health.label', label: 'Salud de pago' },
  ],

  memberships: [
    { key: 'associate.internal_code', label: 'Código asociado' },
    { key: 'associate.company_name', label: 'Razón social' },
    { key: 'membership_type.label', label: 'Tipo' },
    { key: 'category.name', label: 'Categoría' },
    { key: 'fee_amount', label: 'Tarifa', format: 'currency' },
    { key: 'start_date', label: 'Inicio', format: 'date' },
    { key: 'end_date', label: 'Fin', format: 'date' },
    { key: 'membership_status.label', label: 'Estado' },
    { key: 'is_current', label: 'Vigente' },
  ],

  payments: [
    { key: 'associate.internal_code', label: 'Código asociado' },
    { key: 'associate.company_name', label: 'Razón social' },
    { key: 'payment_date', label: 'Fecha de pago', format: 'date' },
    { key: 'amount_paid', label: 'Monto pagado', format: 'currency' },
    { key: 'operation_code', label: 'Código operación' },
    { key: 'payment_method.label', label: 'Método de pago' },
  ],

  schedules: [
    { key: 'associate.internal_code', label: 'Código asociado' },
    { key: 'associate.company_name', label: 'Razón social' },
    { key: 'due_date', label: 'Vencimiento', format: 'date' },
    { key: 'expected_amount', label: 'Monto esperado', format: 'currency' },
    { key: 'is_paid', label: 'Pagado' },
    { key: 'collection_status.label', label: 'Estado cobranza' },
    { key: 'period_year', label: 'Año', format: 'number' },
    { key: 'period_month', label: 'Mes', format: 'number' },
  ],

  collections: [
    { key: 'associate.internal_code', label: 'Código asociado' },
    { key: 'associate.company_name', label: 'Razón social' },
    { key: 'action_date', label: 'Fecha de gestión', format: 'date' },
    { key: 'subject', label: 'Asunto' },
    { key: 'contact_type.label', label: 'Tipo de contacto' },
    { key: 'action_result.label', label: 'Resultado' },
    { key: 'managed_by.full_name', label: 'Responsable' },
  ],

  documents: [
    { key: 'title', label: 'Título' },
    { key: 'original_filename', label: 'Archivo original' },
    { key: 'document_type.label', label: 'Tipo' },
    { key: 'document_category.label', label: 'Categoría' },
    { key: 'associate.company_name', label: 'Asociado' },
    { key: 'file_extension', label: 'Extensión' },
    { key: 'size_bytes', label: 'Tamaño (bytes)', format: 'number' },
    { key: 'uploaded_at', label: 'Fecha de carga', format: 'date' },
  ],
}
