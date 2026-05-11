-- ============================================
-- Hito S5: reportes, exportaciones y automatizaciones
-- ============================================

create or replace view public.report_prospects_summary
with (security_invoker = true)
as
select
  p.id,
  p.company_name,
  p.ruc,
  p.created_at,
  ps.code as prospect_status_code,
  ps.label as prospect_status_label,
  c.code as category_code,
  c.name as category_name,
  cap.full_name as captador_full_name
from public.prospects p
left join public.catalog_items ps on ps.id = p.prospect_status_id
left join public.categories c on c.id = p.current_category_id
left join public.captadores cap on cap.id = p.captador_id
where p.is_deleted = false;

create or replace view public.report_associates_summary
with (security_invoker = true)
as
select
  a.id,
  a.internal_code,
  a.company_name,
  a.trade_name,
  a.ruc,
  a.association_date,
  a.corporate_email,
  ast.code as associate_status_code,
  ast.label as associate_status_label,
  c.code as category_code,
  c.name as category_name,
  c.base_fee as category_base_fee,
  at.code as activity_type_code,
  at.label as activity_type_label,
  cs.code as company_size_code,
  cs.label as company_size_label,
  ph.code as payment_health_code,
  ph.label as payment_health_label
from public.associates a
left join public.catalog_items ast on ast.id = a.associate_status_id
left join public.categories c on c.id = a.category_id
left join public.catalog_items at on at.id = a.activity_type_id
left join public.catalog_items cs on cs.id = a.company_size_id
left join public.catalog_items ph on ph.id = a.payment_health_status_id
where a.is_deleted = false;

create or replace view public.report_memberships_summary
with (security_invoker = true)
as
select
  m.id,
  m.fee_amount,
  m.currency_code,
  m.start_date,
  m.end_date,
  m.is_current,
  mt.code as membership_type_code,
  mt.label as membership_type_label,
  c.code as category_code,
  c.name as category_name,
  ms.code as membership_status_code,
  ms.label as membership_status_label,
  a.id as associate_id,
  a.company_name as associate_company_name,
  a.ruc as associate_ruc,
  a.internal_code as associate_internal_code
from public.memberships m
left join public.catalog_items mt on mt.id = m.membership_type_id
left join public.categories c on c.id = m.category_id
left join public.catalog_items ms on ms.id = m.membership_status_id
left join public.associates a on a.id = m.associate_id
where m.is_deleted = false;

create or replace view public.report_payments_summary
with (security_invoker = true)
as
select
  p.id,
  p.payment_date,
  p.amount_paid,
  p.operation_code,
  p.is_reversed,
  pm.code as payment_method_code,
  pm.label as payment_method_label,
  a.id as associate_id,
  a.company_name as associate_company_name,
  a.ruc as associate_ruc,
  a.internal_code as associate_internal_code
from public.payments p
left join public.catalog_items pm on pm.id = p.payment_method_id
left join public.associates a on a.id = p.associate_id
where p.is_deleted = false
  and p.is_reversed = false;

create or replace view public.report_schedules_summary
with (security_invoker = true)
as
select
  ps.id,
  ps.due_date,
  ps.expected_amount,
  ps.is_paid,
  ps.paid_at,
  ps.period_year,
  ps.period_month,
  cs.code as collection_status_code,
  cs.label as collection_status_label,
  a.id as associate_id,
  a.company_name as associate_company_name,
  a.ruc as associate_ruc,
  a.internal_code as associate_internal_code
from public.payment_schedules ps
left join public.catalog_items cs on cs.id = ps.collection_status_id
left join public.associates a on a.id = ps.associate_id
where ps.is_deleted = false;

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
  ca.managed_by_user_id
from public.collection_actions ca
left join public.catalog_items ct on ct.id = ca.contact_type_id
left join public.catalog_items cr on cr.id = ca.action_result_id
left join public.associates a on a.id = ca.associate_id
where ca.is_deleted = false;

create or replace view public.report_documents_summary
with (security_invoker = true)
as
select
  d.id,
  d.title,
  d.original_filename,
  d.mime_type,
  d.size_bytes,
  d.uploaded_at,
  d.file_extension,
  dt.code as document_type_code,
  dt.label as document_type_label,
  dc.code as document_category_code,
  dc.label as document_category_label,
  a.id as associate_id,
  a.company_name as associate_company_name,
  a.internal_code as associate_internal_code
from public.documents d
left join public.catalog_items dt on dt.id = d.document_type_id
left join public.catalog_items dc on dc.id = d.document_category_id
left join public.associates a on a.id = d.associate_id
where d.is_deleted = false
  and d.is_latest_version = true;

create or replace view public.dashboard_kpis
with (security_invoker = true)
as
with current_month as (
  select date_trunc('month', current_date)::date as month_start
),
prospects as (
  select
    coalesce(sum(total), 0)::integer as total,
    coalesce(jsonb_object_agg(status_code, total), '{}'::jsonb) as by_status
  from (
    select coalesce(ci.code, 'SIN_ESTADO') as status_code, count(*)::integer as total
    from public.prospects p
    left join public.catalog_items ci on ci.id = p.prospect_status_id
    where p.is_deleted = false
    group by coalesce(ci.code, 'SIN_ESTADO')
  ) grouped
),
associates as (
  select
    coalesce(sum(total), 0)::integer as total,
    coalesce(jsonb_object_agg(status_code, total), '{}'::jsonb) as by_status
  from (
    select coalesce(ci.code, 'SIN_ESTADO') as status_code, count(*)::integer as total
    from public.associates a
    left join public.catalog_items ci on ci.id = a.associate_status_id
    where a.is_deleted = false
    group by coalesce(ci.code, 'SIN_ESTADO')
  ) grouped
),
financial as (
  select
    coalesce(sum(ps.expected_amount) filter (where ps.is_paid = false), 0) as pending,
    count(*) filter (where ps.is_paid = false)::integer as pending_count,
    coalesce(sum(ps.expected_amount) filter (where ps.is_paid = false and ps.due_date < current_date), 0) as overdue,
    count(*) filter (where ps.is_paid = false and ps.due_date < current_date)::integer as overdue_count
  from public.payment_schedules ps
  where ps.is_deleted = false
),
collected as (
  select coalesce(sum(p.amount_paid), 0) as collected_this_month
  from public.payments p
  cross join current_month cm
  where p.is_deleted = false
    and p.is_reversed = false
    and p.payment_date >= cm.month_start
)
select
  1 as id,
  (select total from prospects) as prospects_total,
  (select by_status from prospects) as prospects_by_status,
  (select total from associates) as associates_total,
  (select by_status from associates) as associates_by_status,
  (
    select count(*)::integer
    from public.memberships m
    where m.is_deleted = false
      and m.is_current = true
  ) as memberships_current,
  (select pending from financial) as financial_pending,
  (select pending_count from financial) as financial_pending_count,
  (select overdue from financial) as financial_overdue,
  (select overdue_count from financial) as financial_overdue_count,
  (select collected_this_month from collected) as financial_collected_this_month,
  (
    select count(*)::integer
    from public.documents d
    where d.is_deleted = false
      and d.is_latest_version = true
  ) as documents_total;

create table if not exists public.automation_jobs (
  id uuid primary key default gen_random_uuid(),
  code varchar(100) not null,
  name varchar(160) not null,
  job_type varchar(60) not null,
  status varchar(30) not null default 'ACTIVE',
  config jsonb not null default '{}'::jsonb,
  last_run_at timestamptz,
  next_run_at timestamptz,
  last_result jsonb,
  last_error text,
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_automation_jobs_code unique (code),
  constraint automation_jobs_status_check check (status in ('ACTIVE', 'PAUSED', 'DISABLED'))
);

create table if not exists public.automation_job_runs (
  id uuid primary key default gen_random_uuid(),
  automation_job_id uuid not null references public.automation_jobs(id) on delete cascade,
  status varchar(30) not null default 'RUNNING',
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  result jsonb,
  error_message text,
  triggered_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  constraint automation_job_runs_status_check check (status in ('RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED'))
);

drop trigger if exists trg_automation_jobs_updated_at on public.automation_jobs;
create trigger trg_automation_jobs_updated_at
  before update on public.automation_jobs
  for each row execute function public.fn_set_updated_at();

create index if not exists idx_automation_jobs_status_next_run
  on public.automation_jobs(status, next_run_at);

create index if not exists idx_automation_job_runs_job_started
  on public.automation_job_runs(automation_job_id, started_at desc);

alter table public.automation_jobs enable row level security;
alter table public.automation_job_runs enable row level security;

drop policy if exists automation_jobs_read on public.automation_jobs;
create policy automation_jobs_read on public.automation_jobs
  for select to authenticated
  using (public.has_module_permission('reportes', 'read'));

drop policy if exists automation_jobs_write on public.automation_jobs;
create policy automation_jobs_write on public.automation_jobs
  for all to authenticated
  using (public.has_module_permission('reportes', 'admin'))
  with check (public.has_module_permission('reportes', 'admin'));

drop policy if exists automation_job_runs_read on public.automation_job_runs;
create policy automation_job_runs_read on public.automation_job_runs
  for select to authenticated
  using (public.has_module_permission('reportes', 'read'));

drop policy if exists automation_job_runs_write on public.automation_job_runs;
create policy automation_job_runs_write on public.automation_job_runs
  for all to authenticated
  using (public.has_module_permission('reportes', 'admin'))
  with check (public.has_module_permission('reportes', 'admin'));

insert into public.automation_jobs (code, name, job_type, status, config)
values
  ('RECALCULATE_PAYMENT_HEALTH', 'Recalcular salud de pago', 'financial', 'PAUSED', '{"candidate": true}'::jsonb),
  ('DETECT_OVERDUE_SCHEDULES', 'Detectar cuotas vencidas', 'financial', 'PAUSED', '{"candidate": true}'::jsonb),
  ('PREPARE_COLLECTION_REMINDERS', 'Preparar recordatorios de cobranza', 'collection', 'PAUSED', '{"candidate": true}'::jsonb),
  ('GENERATE_OPERATIONAL_SUMMARY', 'Generar resumen operativo', 'reports', 'PAUSED', '{"candidate": true}'::jsonb),
  ('DETECT_UNCONTEXTUALIZED_DOCUMENTS', 'Detectar documentos sin contexto', 'documents', 'PAUSED', '{"candidate": true}'::jsonb)
on conflict (code) do update set
  name = excluded.name,
  job_type = excluded.job_type,
  config = excluded.config,
  updated_at = now();

grant select on
  public.report_prospects_summary,
  public.report_associates_summary,
  public.report_memberships_summary,
  public.report_payments_summary,
  public.report_schedules_summary,
  public.report_collections_summary,
  public.report_documents_summary,
  public.dashboard_kpis
to authenticated;
