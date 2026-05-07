export interface AuditFields {
  created_at?: string
  updated_at?: string
  created_by?: string | null
  updated_by?: string | null
  is_deleted?: boolean
  deleted_at?: string | null
  deleted_by?: string | null
}

export interface CatalogItem {
  id: string
  code: string
  label: string
}

export interface Category {
  id: string
  code: string
  name: string
  base_fee?: number | null
  min_score?: number | null
  max_score?: number | null
}

export interface UserReference {
  id: string
  first_name?: string | null
  last_name?: string | null
}

