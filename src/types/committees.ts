import type { AuditFields, CatalogItem } from './shared'

export interface Committee extends AuditFields {
  id: string
  code?: string | null
  name: string
  description?: string | null
  is_active: boolean
}

export interface CommitteeAssociate {
  id: string
  joined_at?: string | null
  associate: {
    id: string
    internal_code: string
    company_name: string
    ruc?: string | null
    associate_status?: CatalogItem | null
  }
}

export interface AssociateCommittee extends AuditFields {
  id: string
  associate_id: string
  committee_id: string
  joined_at?: string | null
  left_at?: string | null
  is_primary: boolean
  is_active: boolean
  notes?: string | null
  committee?: Committee | null
}
