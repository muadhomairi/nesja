-- NESJA.OS platform foundation: tenants, identity, memberships, roles, permissions, entitlements, audit.
-- Every business row carries tenant_id. Access is decided in PostgreSQL by RLS using auth.uid() and the
-- caller's membership role in THAT tenant, so a crafted request cannot read another tenant's rows.

create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

-- ---------------------------------------------------------------- enums
create type public.tenant_kind as enum ('customer', 'demo', 'internal');
create type public.tenant_status as enum ('provisioning', 'trial', 'active', 'suspended', 'closed');
create type public.member_status as enum ('invited', 'active', 'suspended', 'removed');
create type public.access_scope as enum ('own', 'business_unit', 'all');

-- ---------------------------------------------------------------- tenants
create table public.tenants (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  name text not null check (length(name) between 2 and 200),
  kind public.tenant_kind not null default 'customer',
  status public.tenant_status not null default 'trial',
  base_currency char(3) not null default 'USD' check (base_currency ~ '^[A-Z]{3}$'),
  default_locale text not null default 'en' check (default_locale in ('en', 'ar')),
  time_zone text not null default 'UTC',
  data_residency text,                        -- e.g. 'eu-central-1'; informs future dedicated deployments
  deployment_model text not null default 'shared' check (deployment_model in ('shared', 'dedicated_db', 'dedicated_stack')),
  trial_ends_at timestamptz,
  converted_from_tenant_id uuid references public.tenants(id),  -- demo → live conversion lineage
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  locale text not null default 'en' check (locale in ('en', 'ar')),
  is_platform_admin boolean not null default false,
  last_tenant_id uuid references public.tenants(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.business_units (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  name text not null,
  parent_id uuid,
  created_at timestamptz not null default now(),
  primary key (tenant_id, id),
  foreign key (tenant_id, parent_id) references public.business_units(tenant_id, id),
  unique (tenant_id, name)
);

-- Permission catalogue is global (code), roles are per tenant so tenants customise without code forks.
create table public.permissions (
  code text primary key check (code ~ '^[a-z_]+\.[a-z_]+$'),
  module text not null,
  description text not null,
  scoped boolean not null default false     -- true when the permission carries own / business_unit / all
);

create table public.roles (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  key text not null check (key ~ '^[a-z][a-z0-9_]{1,40}$'),
  name text not null,
  is_system boolean not null default false,  -- seeded roles; renamable, not deletable
  created_at timestamptz not null default now(),
  primary key (tenant_id, id),
  unique (tenant_id, key)
);

create table public.role_permissions (
  tenant_id uuid not null,
  role_id uuid not null,
  permission_code text not null references public.permissions(code) on delete cascade,
  scope public.access_scope not null default 'all',
  primary key (tenant_id, role_id, permission_code),
  foreign key (tenant_id, role_id) references public.roles(tenant_id, id) on delete cascade
);

create table public.memberships (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null,
  business_unit_id uuid,
  status public.member_status not null default 'active',
  manager_user_id uuid,
  joined_at timestamptz not null default now(),
  primary key (tenant_id, user_id),
  foreign key (tenant_id, role_id) references public.roles(tenant_id, id),
  foreign key (tenant_id, business_unit_id) references public.business_units(tenant_id, id)
);
create index memberships_user_idx on public.memberships(user_id) where status = 'active';

create table public.invitations (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  id uuid not null default gen_random_uuid(),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  role_id uuid not null,
  business_unit_id uuid,
  token_hash text not null unique,            -- sha256 of the emailed token; the token itself is never stored
  invited_by uuid not null references auth.users(id),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (tenant_id, id),
  foreign key (tenant_id, role_id) references public.roles(tenant_id, id)
);
create unique index invitations_open_email_idx on public.invitations(tenant_id, lower(email))
  where accepted_at is null and revoked_at is null;

-- ---------------------------------------------------------------- subscriptions and entitlements
-- Plans carry NO prices here: prices are not approved yet and payment collection is not activated.
create table public.products (
  code text primary key check (code in ('commercial', 'engage', 'deliver')),
  name text not null,
  availability text not null check (availability in ('available', 'external', 'coming_soon'))
);

create table public.plans (
  code text primary key,
  name text not null,
  is_trial boolean not null default false,
  default_seats int not null check (default_seats > 0),
  price_status text not null default 'unpriced' check (price_status in ('unpriced', 'approved')),
  external_price_ref text                     -- billing provider price id once commercial terms are approved
);

create table public.subscriptions (
  tenant_id uuid primary key references public.tenants(id) on delete cascade,
  plan_code text not null references public.plans(code),
  status text not null check (status in ('trialing', 'active', 'past_due', 'suspended', 'cancelled')),
  seats int not null check (seats > 0),
  trial_ends_at timestamptz,
  billing_provider text,                      -- null until a provider is configured
  billing_customer_ref text,
  updated_at timestamptz not null default now()
);

create table public.entitlements (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  product_code text not null references public.products(code),
  enabled boolean not null default true,
  limits jsonb not null default '{}'::jsonb,
  primary key (tenant_id, product_code)
);

create table public.usage_events (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  id bigint generated always as identity,
  metric text not null,
  quantity numeric(18,4) not null check (quantity >= 0),
  occurred_at timestamptz not null default now(),
  primary key (tenant_id, id)
);

-- ---------------------------------------------------------------- audit (append-only)
create table public.audit_log (
  id bigint generated always as identity primary key,
  tenant_id uuid references public.tenants(id) on delete cascade,  -- null = platform event
  actor_user_id uuid,
  actor_kind text not null default 'user' check (actor_kind in ('user', 'system', 'ai', 'platform_admin')),
  action text not null,
  entity text not null,
  entity_id text,
  before jsonb,
  after jsonb,
  occurred_at timestamptz not null default now()
);
create index audit_log_tenant_idx on public.audit_log(tenant_id, occurred_at desc);

-- ---------------------------------------------------------------- background jobs (tenant-aware queue)
create table public.jobs (
  id bigint generated always as identity primary key,
  tenant_id uuid references public.tenants(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'running', 'done', 'failed', 'cancelled')),
  run_after timestamptz not null default now(),
  attempts int not null default 0,
  last_error text,
  locked_at timestamptz,
  created_at timestamptz not null default now()
);
create index jobs_ready_idx on public.jobs(run_after) where status = 'queued';

-- ---------------------------------------------------------------- security helpers
create or replace function private.is_platform_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select coalesce((select p.is_platform_admin from public.profiles p where p.user_id = auth.uid()), false)
$$;

create or replace function private.is_member(p_tenant uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.memberships m join public.tenants t on t.id = m.tenant_id
    where m.tenant_id = p_tenant and m.user_id = auth.uid() and m.status = 'active'
      and t.status in ('trial', 'active')
  )
$$;

-- Scope the caller holds for a permission in a tenant, or null when they lack it.
create or replace function private.scope_for(p_tenant uuid, p_permission text) returns public.access_scope
language sql stable security definer set search_path = '' as $$
  select rp.scope
  from public.memberships m
  join public.tenants t on t.id = m.tenant_id and t.status in ('trial', 'active')
  join public.role_permissions rp on rp.tenant_id = m.tenant_id and rp.role_id = m.role_id
  where m.tenant_id = p_tenant and m.user_id = auth.uid() and m.status = 'active'
    and rp.permission_code = p_permission
$$;

create or replace function private.has_perm(p_tenant uuid, p_permission text) returns boolean
language sql stable set search_path = '' as $$
  select private.scope_for(p_tenant, p_permission) is not null
$$;

-- Record-level check: permission present and the row falls inside the caller's scope.
create or replace function private.can(p_tenant uuid, p_permission text, p_owner uuid, p_unit uuid)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare
  v_scope public.access_scope := private.scope_for(p_tenant, p_permission);
  v_unit uuid;
begin
  if v_scope is null then return false; end if;
  if v_scope = 'all' then return true; end if;
  if p_owner = auth.uid() then return true; end if;
  if v_scope = 'business_unit' then
    select m.business_unit_id into v_unit from public.memberships m
     where m.tenant_id = p_tenant and m.user_id = auth.uid();
    return v_unit is not null and v_unit = p_unit;
  end if;
  return false;
end $$;

grant execute on all functions in schema private to authenticated, service_role;

-- Generic audit trigger for business tables (tenant_id + id columns).
create or replace function private.audit_row() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.audit_log(tenant_id, actor_user_id, actor_kind, action, entity, entity_id, before, after)
  values (
    coalesce(new.tenant_id, old.tenant_id), auth.uid(),
    coalesce(nullif(current_setting('nesja.actor_kind', true), ''), case when auth.uid() is null then 'system' else 'user' end),
    lower(tg_op), tg_table_name, coalesce(new.id, old.id)::text,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end);
  return coalesce(new, old);
end $$;

create or replace function private.touch_updated() returns trigger language plpgsql as $$
begin new.updated_at := now(); return new; end $$;

create or replace function private.forbid_change() returns trigger language plpgsql as $$
begin raise exception '% is append-only', tg_table_name using errcode = '42501'; end $$;

create trigger audit_log_append_only before update or delete on public.audit_log
  for each row execute function private.forbid_change();
create trigger tenants_touch before update on public.tenants for each row execute function private.touch_updated();
create trigger profiles_touch before update on public.profiles for each row execute function private.touch_updated();

-- ---------------------------------------------------------------- RLS
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.business_units enable row level security;
alter table public.permissions enable row level security;
alter table public.roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.memberships enable row level security;
alter table public.invitations enable row level security;
alter table public.products enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.entitlements enable row level security;
alter table public.usage_events enable row level security;
alter table public.audit_log enable row level security;
alter table public.jobs enable row level security;   -- no policies: service role only

create policy tenants_read on public.tenants for select to authenticated
  using (private.is_member(id) or private.is_platform_admin());
create policy tenants_update on public.tenants for update to authenticated
  using (private.has_perm(id, 'admin.tenant')) with check (private.has_perm(id, 'admin.tenant'));

create policy profiles_self on public.profiles for select to authenticated
  using (user_id = auth.uid() or exists (
    select 1 from public.memberships a join public.memberships b on a.tenant_id = b.tenant_id
    where a.user_id = auth.uid() and a.status = 'active' and b.user_id = profiles.user_id));
create policy profiles_self_update on public.profiles for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid() and is_platform_admin = (select p.is_platform_admin from public.profiles p where p.user_id = auth.uid()));

create policy bu_read on public.business_units for select to authenticated using (private.is_member(tenant_id));
create policy bu_admin on public.business_units for all to authenticated
  using (private.has_perm(tenant_id, 'admin.org')) with check (private.has_perm(tenant_id, 'admin.org'));

create policy permissions_read on public.permissions for select to authenticated using (true);
create policy products_read on public.products for select to authenticated using (true);
create policy plans_read on public.plans for select to authenticated using (true);

create policy roles_read on public.roles for select to authenticated using (private.is_member(tenant_id));
create policy roles_admin on public.roles for all to authenticated
  using (private.has_perm(tenant_id, 'admin.roles')) with check (private.has_perm(tenant_id, 'admin.roles'));
create policy role_perms_read on public.role_permissions for select to authenticated using (private.is_member(tenant_id));
create policy role_perms_admin on public.role_permissions for all to authenticated
  using (private.has_perm(tenant_id, 'admin.roles')) with check (private.has_perm(tenant_id, 'admin.roles'));

create policy memberships_read on public.memberships for select to authenticated
  using (user_id = auth.uid() or private.is_member(tenant_id));
create policy memberships_admin on public.memberships for update to authenticated
  using (private.has_perm(tenant_id, 'admin.users')) with check (private.has_perm(tenant_id, 'admin.users'));

create policy invitations_admin on public.invitations for all to authenticated
  using (private.has_perm(tenant_id, 'admin.users')) with check (private.has_perm(tenant_id, 'admin.users'));

create policy subscriptions_read on public.subscriptions for select to authenticated using (private.is_member(tenant_id));
create policy entitlements_read on public.entitlements for select to authenticated using (private.is_member(tenant_id));
create policy usage_read on public.usage_events for select to authenticated using (private.has_perm(tenant_id, 'admin.billing'));
create policy audit_read on public.audit_log for select to authenticated
  using (tenant_id is not null and private.has_perm(tenant_id, 'admin.audit'));

grant usage on schema public to authenticated;
grant select on all tables in schema public to authenticated;
grant insert, update, delete on public.business_units, public.roles, public.role_permissions, public.invitations to authenticated;
grant update on public.tenants, public.profiles, public.memberships to authenticated;
revoke all on public.jobs, public.usage_events from authenticated;
grant select on public.usage_events to authenticated;
revoke insert, update, delete on public.audit_log from authenticated;
