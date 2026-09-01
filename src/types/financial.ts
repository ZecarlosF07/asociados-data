import type { AuditFields, CatalogItem, Category } from './shared'

export interface Membership extends AuditFields {
  id: string
  associate_id: string
  fee_amount: number
  currency_code: string
  start_date: string
  end_date?: string | null
  effective_end_date?: string | null
  operational_end_date?: string | null
  renewed_from_membership_id?: string | null
  successor_membership_id?: string | null
  is_current: boolean
  is_effective?: boolean
  is_scheduled?: boolean
  category_id?: string | null
  membership_type_id?: string | null
  membership_status_id?: string | null
  membership_type?: CatalogItem | null
  membership_status?: CatalogItem | null
  category?: Category | null
}

export interface PaymentSchedule extends AuditFields {
  id: string
  associate_id: string
  membership_id: string
  due_date: string
  expected_amount: number
  paid_amount?: number
  outstanding_amount?: number
  is_paid: boolean
  is_operational?: boolean
  is_collectible?: boolean
  membership_start_date?: string
  membership_effective_status_code?: string
  financial_status_code?: string
  financial_status_label?: string
  has_collection_management?: boolean
  paid_at?: string | null
  period_year: number
  period_month?: number | null
  collection_status_id?: string | null
  collection_status?: CatalogItem | null
  membership?: {
    id: string
    membership_type_id?: string | null
    membership_type?: CatalogItem | null
  } | null
}

export interface Payment extends AuditFields {
  id: string
  associate_id: string
  membership_id?: string | null
  payment_schedule_id?: string | null
  payment_date: string
  amount_paid: number
  operation_code?: string | null
  is_reversed: boolean
  payment_method_id?: string | null
  payment_method?: CatalogItem | null
}

export interface CollectionAction extends AuditFields {
  id: string
  associate_id: string
  payment_schedule_id?: string | null
  subject: string
  detail?: string | null
  action_date: string
  contact_type_id?: string | null
  result_id?: string | null
}
