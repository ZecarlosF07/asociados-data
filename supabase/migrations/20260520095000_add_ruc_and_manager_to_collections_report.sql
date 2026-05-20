-- Completa la vista de gestiones para que el reporte pueda mostrar RUC
-- del asociado y responsable de cobranza sin consultas adicionales.

create or replace view public.report_collections_summary
with (security_invoker = true)
as
select
  ca.id,
  ca.subject,
  ca.short_observation,
  ca.action_date,
  ca.created_at,
  ct.code as contact_type_code,
  ct.label as contact_type_label,
  cr.code as action_result_code,
  cr.label as action_result_label,
  a.id as associate_id,
  a.company_name as associate_company_name,
  a.internal_code as associate_internal_code,
  ca.managed_by_user_id,
  a.ruc as associate_ruc,
  nullif(trim(concat_ws(' ', up.first_name, up.last_name)), '') as managed_by_full_name
from public.collection_actions ca
left join public.catalog_items ct on ct.id = ca.contact_type_id
left join public.catalog_items cr on cr.id = ca.action_result_id
left join public.associates a on a.id = ca.associate_id
left join public.user_profiles up on up.id = ca.managed_by_user_id
where ca.is_deleted = false;
