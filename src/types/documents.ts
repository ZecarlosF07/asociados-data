import type { AuditFields, CatalogItem } from './shared'

export interface StorageNode extends AuditFields {
  id: string
  parent_id?: string | null
  name: string
  slug: string
}

export interface DocumentRecord extends AuditFields {
  id: string
  title: string
  original_filename: string
  storage_bucket: string
  storage_path: string
  mime_type?: string | null
  file_extension?: string | null
  size_bytes?: number | null
  version_number: number
  is_latest_version: boolean
  associate_id?: string | null
  prospect_id?: string | null
  storage_node_id?: string | null
  document_category_id?: string | null
  document_type_id?: string | null
  document_category?: CatalogItem | null
  document_type?: CatalogItem | null
  storage_node?: StorageNode | null
}

