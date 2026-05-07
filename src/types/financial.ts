import type { AuditFields, CatalogItem } from './shared'

export interface Membership extends AuditFields {
  id: string
  associate_id: string
  fee_amount: number
  currency_code: string
  start_date: string
  end_date?: string | null
  is_current: boolean
  membership_type_id?: string | null
  membership_status_id?: string | null
  membership_type?: CatalogItem | null
  membership_status?: CatalogItem | null
}

export interface PaymentSchedule extends AuditFields {
  id: string
  associate_id: string
  membership_id: string
  due_date: string
  expected_amount: number
  is_paid: boolean
  paid_at?: string | null
  period_year: number
  period_month?: number | null
  collection_status_id?: string | null
  collection_status?: CatalogItem | null
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

