import type { AuditFields, CatalogItem, Category } from './shared'

export interface Captador extends AuditFields {
  id: string
  full_name: string
  is_internal: boolean
  email?: string | null
  phone?: string | null
}

export interface Prospect extends AuditFields {
  id: string
  company_name: string
  ruc?: string | null
  trade_name?: string | null
  primary_email?: string | null
  economic_activity?: string | null
  prospect_status_id?: string | null
  current_category_id?: string | null
  captador_id?: string | null
  converted_to_associate_id?: string | null
  converted_at?: string | null
  prospect_status?: CatalogItem | null
  current_category?: Category | null
  captador?: Captador | null
}

export interface ProspectQuote extends AuditFields {
  id: string
  prospect_id: string
  quote_code: string
  amount: number
  currency_code: string
  quote_status_id?: string | null
}

