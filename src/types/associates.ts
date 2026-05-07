import type { AuditFields, CatalogItem, Category, UserReference } from './shared'
import type { Captador } from './prospects'

export interface Associate extends AuditFields {
  id: string
  internal_code: string
  company_name: string
  ruc?: string | null
  trade_name?: string | null
  corporate_email?: string | null
  associate_status_id?: string | null
  category_id?: string | null
  captador_id?: string | null
  prospect_origin_id?: string | null
  association_date?: string | null
  associate_status?: CatalogItem | null
  category?: Category | null
  captador?: Captador | null
  affiliation_responsible?: UserReference | null
  payment_health?: CatalogItem | null
}

export interface AssociatePerson extends AuditFields {
  id: string
  associate_id: string
  full_name: string
  person_role_id?: string | null
  email?: string | null
  phone?: string | null
  person_role?: CatalogItem | null
}

export interface AssociateAreaContact extends AuditFields {
  id: string
  associate_id: string
  full_name: string
  area_id?: string | null
  email?: string | null
  phone?: string | null
  area?: CatalogItem | null
}

