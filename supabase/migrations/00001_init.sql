-- ============================================================
-- AgencyOS - Initial Schema
-- ============================================================
create extension if not exists pgcrypto;

-- 1. ENUMS -----------------------------------------------------
create type user_role         as enum ('owner','manager','member','client');
create type lead_stage        as enum ('new_lead','contacted','discovery_scheduled','discovery_completed','proposal_sent','negotiation','won','lost');
create type proposal_status   as enum ('draft','sent','viewed','accepted','rejected');
create type contract_status   as enum ('draft','pending','signed','expired');
create type invoice_status    as enum ('draft','sent','paid','partially_paid','overdue');
create type project_stage     as enum ('planning','in_progress','review','client_approval','completed');
create type task_status       as enum ('todo','in_progress','review','done');
create type task_priority     as enum ('low','medium','high','urgent');
create type deliverable_status as enum ('pending','submitted','approved','rejected');
create type file_folder       as enum ('contracts','invoices','deliverables','assets','client_files');
create type activity_type     as enum ('meeting','email','call','note','proposal','payment','deliverable','status_change');
create type conversation_type as enum ('internal','client');

-- 2. TABLES ----------------------------------------------------
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text not null default '',
  role          user_role not null default 'member',
  title         text,
  avatar_url    text,
  hourly_rate   numeric(10,2),
  is_suspended  boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table leads (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  company    text,
  email      text,
  phone      text,
  website    text,
  industry   text,
  source     text,
  notes      text,
  stage      lead_stage not null default 'new_lead',
  score      int not null default 0 check (score between 0 and 100),
  owner_id   uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clients (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  company        text,
  email          text,
  phone          text,
  website        text,
  industry       text,
  address        text,
  notes          text,
  lead_id        uuid references leads(id) on delete set null,
  portal_user_id uuid references profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
alter table leads add column converted_client_id uuid references clients(id) on delete set null;

create table activities (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references clients(id) on delete cascade,
  lead_id     uuid references leads(id) on delete cascade,
  type        activity_type not null,
  title       text not null,
  description text,
  actor_id    uuid references profiles(id) on delete set null,
  occurred_at timestamptz not null default now()
);

create table proposals (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid references clients(id) on delete set null,
  lead_id      uuid references leads(id) on delete set null,
  title        text not null,
  scope        text,
  deliverables text,
  timeline     text,
  terms        text,
  amount       numeric(12,2) not null default 0,
  status       proposal_status not null default 'draft',
  sent_at      timestamptz,
  viewed_at    timestamptz,
  decided_at   timestamptz,
  created_by   uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table proposal_items (
  id          uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references proposals(id) on delete cascade,
  description text not null,
  qty         numeric(10,2) not null default 1,
  unit_price  numeric(12,2) not null default 0
);

create table contracts (
  id             uuid primary key default gen_random_uuid(),
  client_id      uuid not null references clients(id) on delete cascade,
  proposal_id    uuid references proposals(id) on delete set null,
  title          text not null,
  body           text not null default '',
  status         contract_status not null default 'draft',
  version        int not null default 1,
  signed_at      timestamptz,
  signed_by_name text,
  signature_data text,
  signer_ip      text,
  expires_at     timestamptz,
  created_by     uuid references profiles(id) on delete set null,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create table contract_versions (
  id          uuid primary key default gen_random_uuid(),
  contract_id uuid not null references contracts(id) on delete cascade,
  version     int not null,
  body        text not null,
  created_at  timestamptz not null default now(),
  unique (contract_id, version)
);

create table projects (
  id          uuid primary key default gen_random_uuid(),
  client_id   uuid references clients(id) on delete set null,
  contract_id uuid references contracts(id) on delete set null,
  name        text not null,
  description text,
  stage       project_stage not null default 'planning',
  budget      numeric(12,2),
  deadline    date,
  notes       text,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table project_members (
  project_id      uuid not null references projects(id) on delete cascade,
  profile_id      uuid not null references profiles(id) on delete cascade,
  role_in_project text not null default 'contributor',
  primary key (project_id, profile_id)
);

create table milestones (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  title        text not null,
  due_date     date,
  amount       numeric(12,2) not null default 0,
  is_completed boolean not null default false,
  completed_at timestamptz
);

create table tasks (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  milestone_id uuid references milestones(id) on delete set null,
  title        text not null,
  description  text,
  status       task_status not null default 'todo',
  priority     task_priority not null default 'medium',
  assignee_id  uuid references profiles(id) on delete set null,
  due_date     date,
  position     int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table files (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  folder       file_folder not null default 'assets',
  storage_path text not null,
  mime_type    text,
  size_bytes   bigint,
  project_id   uuid references projects(id) on delete set null,
  client_id    uuid references clients(id) on delete set null,
  uploaded_by  uuid references profiles(id) on delete set null,
  created_at   timestamptz not null default now()
);

create table deliverables (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references projects(id) on delete cascade,
  milestone_id uuid references milestones(id) on delete set null,
  title        text not null,
  file_id      uuid references files(id) on delete set null,
  status       deliverable_status not null default 'pending',
  approved_by  uuid references profiles(id) on delete set null,
  approved_at  timestamptz,
  created_at   timestamptz not null default now()
);

create sequence invoice_seq;
create table invoices (
  id                 uuid primary key default gen_random_uuid(),
  number             text not null unique default ('INV-' || lpad(nextval('invoice_seq')::text, 5, '0')),
  client_id          uuid not null references clients(id) on delete cascade,
  project_id         uuid references projects(id) on delete set null,
  status             invoice_status not null default 'draft',
  issue_date         date not null default current_date,
  due_date           date not null default current_date + 14,
  subtotal           numeric(12,2) not null default 0,
  tax_rate           numeric(5,2) not null default 0,
  tax_amount         numeric(12,2) not null default 0,
  total              numeric(12,2) not null default 0,
  amount_paid        numeric(12,2) not null default 0,
  is_recurring       boolean not null default false,
  recurring_interval text,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table invoice_items (
  id          uuid primary key default gen_random_uuid(),
  invoice_id  uuid not null references invoices(id) on delete cascade,
  description text not null,
  qty         numeric(10,2) not null default 1,
  unit_price  numeric(12,2) not null default 0
);

create table payments (
  id         uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  amount     numeric(12,2) not null,
  paid_at    timestamptz not null default now(),
  method     text,
  reference  text
);

create table time_entries (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null references profiles(id) on delete cascade,
  project_id       uuid references projects(id) on delete set null,
  task_id          uuid references tasks(id) on delete set null,
  started_at       timestamptz not null default now(),
  duration_minutes int not null default 0,
  notes            text
);

create table conversations (
  id         uuid primary key default gen_random_uuid(),
  type       conversation_type not null default 'internal',
  title      text not null,
  project_id uuid references projects(id) on delete set null,
  client_id  uuid references clients(id) on delete set null,
  created_at timestamptz not null default now()
);

create table conversation_participants (
  conversation_id uuid not null references conversations(id) on delete cascade,
  profile_id      uuid not null references profiles(id) on delete cascade,
  primary key (conversation_id, profile_id)
);

create table messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id       uuid not null references profiles(id) on delete cascade,
  body            text not null,
  created_at      timestamptz not null default now()
);

create table notifications (
  id         uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  title      text not null,
  body       text,
  link       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

create table automation_rules (
  id         uuid primary key default gen_random_uuid(),
  key        text not null unique,
  name       text not null,
  is_enabled boolean not null default true
);

-- 3. INDEXES ---------------------------------------------------
create index idx_leads_stage            on leads(stage);
create index idx_leads_owner            on leads(owner_id);
create index idx_clients_portal_user    on clients(portal_user_id);
create index idx_activities_client      on activities(client_id, occurred_at desc);
create index idx_activities_lead        on activities(lead_id, occurred_at desc);
create index idx_proposals_client       on proposals(client_id);
create index idx_proposals_status       on proposals(status);
create index idx_proposal_items_prop    on proposal_items(proposal_id);
create index idx_contracts_client       on contracts(client_id);
create index idx_contract_versions_c    on contract_versions(contract_id);
create index idx_projects_client        on projects(client_id);
create index idx_projects_stage         on projects(stage);
create index idx_tasks_project          on tasks(project_id);
create index idx_tasks_assignee         on tasks(assignee_id);
create index idx_tasks_status           on tasks(status);
create index idx_milestones_project     on milestones(project_id);
create index idx_deliverables_project   on deliverables(project_id);
create index idx_invoices_client        on invoices(client_id);
create index idx_invoices_status_due    on invoices(status, due_date);
create index idx_invoice_items_invoice  on invoice_items(invoice_id);
create index idx_payments_invoice       on payments(invoice_id);
create index idx_time_entries_profile   on time_entries(profile_id);
create index idx_time_entries_project   on time_entries(project_id);
create index idx_messages_conversation  on messages(conversation_id, created_at);
create index idx_notifications_profile  on notifications(profile_id, is_read);
create index idx_files_project          on files(project_id);
create index idx_files_client           on files(client_id);

-- 4. RBAC HELPERS ---------------------------------------------
create or replace function public.current_user_role() returns user_role
language sql stable security definer set search_path = public as
$$ select role from profiles where id = auth.uid() and not is_suspended $$;

create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = public as
$$ select current_user_role() in ('owner','manager','member') $$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as
$$ select current_user_role() in ('owner','manager') $$;

create or replace function public.my_client_id() returns uuid
language sql stable security definer set search_path = public as
$$ select id from clients where portal_user_id = auth.uid() limit 1 $$;

create or replace function public.rule_enabled(p_key text) returns boolean
language sql stable security definer set search_path = public as
$$ select coalesce((select is_enabled from automation_rules where key = p_key), false) $$;

-- 5. GENERAL TRIGGERS ------------------------------------------
create or replace function public.set_updated_at() returns trigger language plpgsql as
$$ begin new.updated_at := now(); return new; end $$;

do $$ declare t text; begin
  foreach t in array array['profiles','leads','clients','proposals','contracts','projects','tasks','invoices'] loop
    execute format('create trigger trg_%s_updated before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end $$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_role user_role;
begin
  if (select count(*) from profiles) = 0 then v_role := 'owner';
  else v_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'member');
  end if;
  insert into profiles (id, email, full_name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name',''), v_role);
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.snapshot_contract_version() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.body is distinct from old.body then
    new.version := old.version + 1;
    insert into contract_versions (contract_id, version, body) values (old.id, old.version, old.body);
  end if;
  return new;
end $$;
create trigger trg_contract_version before update on contracts
  for each row execute function snapshot_contract_version();

-- 6. AUTOMATION TRIGGERS ---------------------------------------
create or replace function public.on_proposal_decided() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_client uuid;
begin
  if new.status in ('accepted','rejected') and old.status is distinct from new.status then
    new.decided_at := now();
  end if;
  if new.status = 'accepted' and old.status is distinct from 'accepted'
     and rule_enabled('client_on_proposal_accept')
     and new.client_id is null and new.lead_id is not null then
    insert into clients (name, company, email, phone, website, industry, lead_id)
    select l.name, l.company, l.email, l.phone, l.website, l.industry, l.id
    from leads l where l.id = new.lead_id
    returning id into v_client;
    new.client_id := v_client;
    update leads set stage = 'won', converted_client_id = v_client where id = new.lead_id;
    insert into activities (client_id, type, title)
    values (v_client, 'proposal', 'Proposal accepted: ' || new.title);
  end if;
  return new;
end $$;
create trigger trg_proposal_decided before update on proposals
  for each row execute function on_proposal_decided();

create or replace function public.on_contract_signed() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'signed' and old.status is distinct from 'signed' then
    new.signed_at := coalesce(new.signed_at, now());
    if rule_enabled('project_on_contract_sign') then
      insert into projects (client_id, contract_id, name, stage)
      values (new.client_id, new.id, new.title, 'planning');
    end if;
  end if;
  return new;
end $$;
create trigger trg_contract_signed before update on contracts
  for each row execute function on_contract_signed();

create or replace function public.on_milestone_completed() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_invoice uuid; v_client uuid;
begin
  if new.is_completed and not old.is_completed then
    new.completed_at := now();
    select client_id into v_client from projects where id = new.project_id;
    if new.amount > 0 and v_client is not null and rule_enabled('invoice_on_milestone_complete') then
      insert into invoices (client_id, project_id, status)
      values (v_client, new.project_id, 'draft') returning id into v_invoice;
      insert into invoice_items (invoice_id, description, qty, unit_price)
      values (v_invoice, 'Milestone: ' || new.title, 1, new.amount);
    end if;
  end if;
  return new;
end $$;
create trigger trg_milestone_completed before update on milestones
  for each row execute function on_milestone_completed();

create or replace function public.recalc_invoice(p_invoice uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_sub numeric(12,2); v_paid numeric(12,2);
begin
  select coalesce(sum(qty * unit_price),0) into v_sub from invoice_items where invoice_id = p_invoice;
  select coalesce(sum(amount),0) into v_paid from payments where invoice_id = p_invoice;
  update invoices i set
    subtotal    = v_sub,
    tax_amount  = round(v_sub * i.tax_rate / 100, 2),
    total       = v_sub + round(v_sub * i.tax_rate / 100, 2),
    amount_paid = v_paid,
    status = case
      when v_sub > 0 and v_paid >= v_sub + round(v_sub * i.tax_rate / 100, 2) then 'paid'::invoice_status
      when v_paid > 0 then 'partially_paid'::invoice_status
      else i.status end
  where i.id = p_invoice;
end $$;

create or replace function public.trg_recalc_invoice() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform recalc_invoice(coalesce(new.invoice_id, old.invoice_id));
  return coalesce(new, old);
end $$;
create trigger trg_items_recalc    after insert or update or delete on invoice_items
  for each row execute function trg_recalc_invoice();
create trigger trg_payments_recalc after insert or update or delete on payments
  for each row execute function trg_recalc_invoice();

create or replace function public.mark_overdue_invoices() returns void
language plpgsql security definer set search_path = public as $$
begin
  update invoices set status = 'overdue'
  where status in ('sent','partially_paid') and due_date < current_date;
  if rule_enabled('overdue_invoice_reminders') then
    insert into notifications (profile_id, title, body, link)
    select p.id, 'Overdue invoice ' || i.number, 'An invoice is past its due date.', '/dashboard/invoices'
    from invoices i cross join profiles p
    where i.status = 'overdue' and p.role in ('owner','manager');
  end if;
end $$;

create or replace function public.notify_upcoming_deadlines() returns void
language plpgsql security definer set search_path = public as $$
begin
  if rule_enabled('deadline_notifications') then
    insert into notifications (profile_id, title, body, link)
    select pm.profile_id, 'Deadline approaching: ' || pr.name,
           'Project due ' || pr.deadline::text, '/dashboard/projects'
    from projects pr join project_members pm on pm.project_id = pr.id
    where pr.deadline between current_date and current_date + 3
      and pr.stage <> 'completed';
  end if;
end $$;

-- 7. ROW LEVEL SECURITY ----------------------------------------
do $$ declare t text; begin
  foreach t in array array['profiles','leads','clients','activities','proposals','proposal_items',
    'contracts','contract_versions','projects','project_members','milestones','tasks','deliverables',
    'invoices','invoice_items','payments','time_entries','conversations','conversation_participants',
    'messages','notifications','files','automation_rules'] loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

create policy profiles_select      on profiles for select using (is_staff() or id = auth.uid());
create policy profiles_update_self on profiles for update using (id = auth.uid());
create policy profiles_owner_all   on profiles for all
  using (current_user_role() = 'owner') with check (current_user_role() = 'owner');

create policy leads_staff      on leads      for all using (is_staff()) with check (is_staff());
create policy clients_staff    on clients    for all using (is_staff()) with check (is_staff());
create policy clients_self     on clients    for select using (portal_user_id = auth.uid());
create policy activities_staff on activities for all using (is_staff()) with check (is_staff());
create policy activities_client on activities for select using (client_id = my_client_id());

create policy proposals_staff        on proposals for all using (is_staff()) with check (is_staff());
create policy proposals_client_read  on proposals for select using (client_id = my_client_id());
create policy proposals_client_decide on proposals for update
  using (client_id = my_client_id() and status in ('sent','viewed'));
create policy proposal_items_staff   on proposal_items for all using (is_staff()) with check (is_staff());
create policy proposal_items_client  on proposal_items for select
  using (exists (select 1 from proposals p where p.id = proposal_id and p.client_id = my_client_id()));

create policy contracts_staff       on contracts for all using (is_staff()) with check (is_staff());
create policy contracts_client_read on contracts for select using (client_id = my_client_id());
create policy contracts_client_sign on contracts for update
  using (client_id = my_client_id() and status = 'pending');
create policy contract_versions_staff on contract_versions for all using (is_staff()) with check (is_staff());

create policy projects_admin       on projects for all using (is_admin()) with check (is_admin());
create policy projects_member_read on projects for select
  using (is_staff() and exists (select 1 from project_members m where m.project_id = id and m.profile_id = auth.uid()));
create policy projects_client_read on projects for select using (client_id = my_client_id());
create policy project_members_read  on project_members for select using (is_staff());
create policy project_members_admin on project_members for all using (is_admin()) with check (is_admin());

create policy milestones_staff  on milestones for all using (is_staff()) with check (is_staff());
create policy milestones_client on milestones for select
  using (exists (select 1 from projects p where p.id = project_id and p.client_id = my_client_id()));
create policy tasks_staff       on tasks for all using (is_staff()) with check (is_staff());
create policy deliverables_staff       on deliverables for all using (is_staff()) with check (is_staff());
create policy deliverables_client_read on deliverables for select
  using (exists (select 1 from projects p where p.id = project_id and p.client_id = my_client_id()));
create policy deliverables_client_approve on deliverables for update
  using (status = 'submitted'
         and exists (select 1 from projects p where p.id = project_id and p.client_id = my_client_id()));

create policy invoices_admin  on invoices for all using (is_admin()) with check (is_admin());
create policy invoices_client on invoices for select
  using (client_id = my_client_id() and status <> 'draft');
create policy invoice_items_admin  on invoice_items for all using (is_admin()) with check (is_admin());
create policy invoice_items_client on invoice_items for select
  using (exists (select 1 from invoices i where i.id = invoice_id and i.client_id = my_client_id() and i.status <> 'draft'));
create policy payments_admin  on payments for all using (is_admin()) with check (is_admin());
create policy payments_client on payments for select
  using (exists (select 1 from invoices i where i.id = invoice_id and i.client_id = my_client_id()));

create policy time_entries_self  on time_entries for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
create policy time_entries_admin on time_entries for select using (is_admin());

create policy conversations_participant on conversations for select
  using (exists (select 1 from conversation_participants cp where cp.conversation_id = id and cp.profile_id = auth.uid()));
create policy conversations_staff_create on conversations for insert with check (is_staff());
create policy cp_read  on conversation_participants for select using (profile_id = auth.uid() or is_staff());
create policy cp_write on conversation_participants for insert with check (is_staff());
create policy messages_read on messages for select
  using (exists (select 1 from conversation_participants cp
                 where cp.conversation_id = messages.conversation_id and cp.profile_id = auth.uid()));
create policy messages_send on messages for insert
  with check (sender_id = auth.uid()
              and exists (select 1 from conversation_participants cp
                          where cp.conversation_id = messages.conversation_id and cp.profile_id = auth.uid()));

create policy notifications_self on notifications for all
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy files_staff        on files for all using (is_staff()) with check (is_staff());
create policy files_client_read  on files for select
  using (client_id = my_client_id()
         or exists (select 1 from projects p where p.id = files.project_id and p.client_id = my_client_id()));
create policy files_client_upload on files for insert
  with check (uploaded_by = auth.uid() and client_id = my_client_id());

create policy automation_rules_read  on automation_rules for select using (is_staff());
create policy automation_rules_owner on automation_rules for all
  using (current_user_role() = 'owner') with check (current_user_role() = 'owner');

-- 8. STORAGE ----------------------------------------------------
insert into storage.buckets (id, name, public) values ('files','files', false)
on conflict (id) do nothing;

create policy storage_staff_all on storage.objects for all
  using (bucket_id = 'files' and public.is_staff())
  with check (bucket_id = 'files' and public.is_staff());
create policy storage_client_read on storage.objects for select
  using (bucket_id = 'files' and public.my_client_id() is not null);
create policy storage_client_upload on storage.objects for insert
  with check (bucket_id = 'files' and public.my_client_id() is not null);

-- 9. SEED DATA --------------------------------------------------
insert into automation_rules (key, name) values
  ('client_on_proposal_accept',     'Create client after proposal acceptance'),
  ('project_on_contract_sign',      'Create project after contract signing'),
  ('invoice_on_milestone_complete', 'Generate invoice after milestone completion'),
  ('overdue_invoice_reminders',     'Send reminders for overdue invoices'),
  ('deadline_notifications',        'Notify team about deadlines');
