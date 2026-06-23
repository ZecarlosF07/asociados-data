import { supabase } from '../lib/supabaseClient'

const COMPANY_CONTACT_SELECT = `
  id,
  associate_id,
  area_id,
  full_name,
  position,
  email,
  phone,
  is_primary,
  notes,
  created_at,
  updated_at,
  area:area_id(id, code, label),
  associate:associate_id!inner(
    id,
    internal_code,
    company_name,
    ruc,
    is_deleted,
    associate_status_id,
    category_id,
    associate_status:associate_status_id(id, code, label),
    category:category_id(id, code, name, base_fee),
    committee_assignments:associate_committees(
      id,
      joined_at,
      is_primary,
      is_active,
      is_deleted,
      committee:committee_id(id, code, name, description, is_active)
    )
  )
`

export const companyContactsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('associate_area_contacts')
      .select(COMPANY_CONTACT_SELECT)
      .eq('is_deleted', false)
      .eq('associate.is_deleted', false)
      .order('full_name', { ascending: true })

    if (error) throw error
    return (data || []).map(mapCompanyContact)
  },
}

function mapCompanyContact(contact) {
  return {
    ...contact,
    associate: mapAssociate(contact.associate),
  }
}

function mapAssociate(associate) {
  const assignment = associate?.committee_assignments?.find(
    (item) => item.is_primary && item.is_active && !item.is_deleted
  )

  return {
    ...associate,
    primary_committee: assignment?.committee || null,
    primary_committee_assignment: assignment || null,
  }
}
