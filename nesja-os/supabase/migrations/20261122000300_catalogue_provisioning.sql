-- Permission catalogue, role templates, products/plans (unpriced), organization provisioning, invitations,
-- tenant-scoped storage, and tenant export / deletion requests.

insert into public.permissions(code, module, description, scoped) values
  ('account.view', 'account', 'See accounts and contacts in scope', true),
  ('account.create', 'account', 'Create accounts and contacts', false),
  ('account.edit', 'account', 'Change accounts and contacts in scope', true),
  ('account.delete', 'account', 'Delete accounts', false),
  ('lead.view', 'lead', 'See leads in scope', true),
  ('lead.create', 'lead', 'Create leads', false),
  ('lead.edit', 'lead', 'Change leads in scope', true),
  ('lead.delete', 'lead', 'Delete leads', false),
  ('opportunity.view', 'opportunity', 'See opportunities in scope', true),
  ('opportunity.create', 'opportunity', 'Create opportunities', false),
  ('opportunity.edit', 'opportunity', 'Change opportunities in scope', true),
  ('opportunity.delete', 'opportunity', 'Delete opportunities', false),
  ('opportunity.view_margin', 'opportunity', 'See cost and margin', false),
  ('quote.view', 'quote', 'See quotations in scope', true),
  ('quote.create', 'quote', 'Prepare quotations', false),
  ('quote.edit', 'quote', 'Change draft quotations in scope', true),
  ('quote.delete', 'quote', 'Delete draft quotations', false),
  ('costing.view', 'costing', 'See resource costing', false),
  ('costing.manage', 'costing', 'Manage resource roles, rate cards and bundles', false),
  ('tender.view', 'tender', 'See tenders in scope', true),
  ('tender.create', 'tender', 'Create tenders', false),
  ('tender.edit', 'tender', 'Change tenders in scope', true),
  ('tender.delete', 'tender', 'Delete tenders', false),
  ('agreement.view', 'agreement', 'See agreements in scope', true),
  ('agreement.create', 'agreement', 'Create agreements', false),
  ('agreement.edit', 'agreement', 'Change agreements in scope', true),
  ('agreement.delete', 'agreement', 'Delete agreements', false),
  ('renewal.view', 'renewal', 'See renewals in scope', true),
  ('renewal.create', 'renewal', 'Create renewals', false),
  ('renewal.edit', 'renewal', 'Change renewals in scope', true),
  ('renewal.delete', 'renewal', 'Delete renewals', false),
  ('activity.view', 'activity', 'See activities in scope', true),
  ('activity.create', 'activity', 'Log activities', false),
  ('activity.edit', 'activity', 'Change activities in scope', true),
  ('activity.delete', 'activity', 'Delete activities', false),
  ('approval.view', 'approval', 'See approval requests in scope', true),
  ('approval.create', 'approval', 'Raise approval requests', false),
  ('approval.edit', 'approval', 'Decide approval requests in scope', true),
  ('approval.delete', 'approval', 'Delete approval requests', false),
  ('document.view', 'document', 'See documents in scope', true),
  ('document.create', 'document', 'Upload documents', false),
  ('document.edit', 'document', 'Change documents in scope', true),
  ('document.delete', 'document', 'Delete documents', false),
  ('finance.view', 'finance', 'See MIS actuals in scope', true),
  ('finance.create', 'finance', 'Load MIS actuals', false),
  ('finance.edit', 'finance', 'Correct MIS actuals', true),
  ('finance.delete', 'finance', 'Delete MIS actuals', false),
  ('report.view', 'report', 'Use reports and dashboards', false),
  ('data.import', 'data', 'Import data', false),
  ('data.export', 'data', 'Export data', false),
  ('ai.use', 'ai', 'Use the NESJA assistant on records in scope', false),
  ('admin.tenant', 'admin', 'Change organization settings', false),
  ('admin.org', 'admin', 'Manage business units', false),
  ('admin.users', 'admin', 'Invite and manage users', false),
  ('admin.roles', 'admin', 'Manage roles and permissions', false),
  ('admin.billing', 'admin', 'Manage subscription and seats', false),
  ('admin.audit', 'admin', 'Read the audit log', false);

insert into public.products(code, name, availability) values
  ('commercial', 'NESJA Commercial', 'available'),
  ('engage', 'NESJA Engage', 'external'),
  ('deliver', 'NESJA Deliver', 'coming_soon');

-- No prices: commercial terms are not approved, so every plan is 'unpriced' and no payment is collected.
insert into public.plans(code, name, is_trial, default_seats) values
  ('trial', 'Trial', true, 5),
  ('essential', 'Essential', false, 5),
  ('professional', 'Professional', false, 10),
  ('enterprise', 'Enterprise', false, 25),
  ('demo', 'Demonstration', true, 60);

-- Role templates copied into every new tenant. Tenants can then edit or add roles without code changes.
create table private.role_templates (key text, name text, permission_code text, scope public.access_scope);
insert into private.role_templates
select 'owner', 'Owner', code, 'all'::public.access_scope from public.permissions
union all select 'admin', 'Administrator', code, 'all' from public.permissions where code <> 'admin.billing'
union all select 'executive', 'Executive', code, 'all' from public.permissions
  where code like '%.view' or code in ('opportunity.view_margin', 'report.view', 'data.export', 'ai.use', 'costing.view')
union all select 'sales_manager', 'Sales Manager', code, case when scoped then 'business_unit'::public.access_scope else 'all' end
  from public.permissions where module in ('account', 'lead', 'opportunity', 'quote', 'tender', 'agreement', 'renewal', 'activity', 'approval', 'document', 'report', 'ai')
    and code not like '%.delete'
union all select 'account_manager', 'Account Manager', code, case when scoped then 'own'::public.access_scope else 'all' end
  from public.permissions where module in ('account', 'lead', 'opportunity', 'quote', 'renewal', 'activity', 'document', 'ai')
    and code not like '%.delete' and code <> 'opportunity.view_margin'
union all select 'bid_manager', 'Bid Manager', code, 'all' from public.permissions
  where module in ('tender', 'document') and code not like '%.delete' or code in ('account.view', 'opportunity.view', 'quote.view', 'costing.view')
union all select 'finance', 'Finance', code, 'all' from public.permissions
  where module in ('finance', 'costing') or code in ('opportunity.view', 'opportunity.view_margin', 'quote.view', 'agreement.view',
    'approval.view', 'approval.edit', 'account.view', 'report.view', 'data.export', 'data.import')
union all select 'viewer', 'Viewer', code, 'all' from public.permissions
  where code in ('account.view', 'opportunity.view', 'report.view');

create or replace function private.seed_tenant_roles(p_tenant uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.roles(tenant_id, key, name, is_system)
  select distinct p_tenant, t.key, t.name, true from private.role_templates t
  on conflict (tenant_id, key) do nothing;
  insert into public.role_permissions(tenant_id, role_id, permission_code, scope)
  select p_tenant, r.id, t.permission_code, t.scope
  from private.role_templates t join public.roles r on r.tenant_id = p_tenant and r.key = t.key
  on conflict do nothing;
end $$;

-- ---------------------------------------------------------------- organization provisioning (self-service)
create or replace function public.create_organization(p_name text, p_slug text, p_currency char(3) default 'USD')
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_tenant uuid;
  v_recent int;
begin
  if v_user is null then raise exception 'sign in first' using errcode = '28000'; end if;
  -- Abuse protection: at most 3 organizations per user per 24 hours.
  select count(*) into v_recent from public.audit_log
   where actor_user_id = v_user and action = 'create' and entity = 'tenants' and occurred_at > now() - interval '24 hours';
  if v_recent >= 3 then raise exception 'organization limit reached; try again tomorrow' using errcode = '54000'; end if;

  insert into public.profiles(user_id, email)
  select u.id, u.email from auth.users u where u.id = v_user
  on conflict (user_id) do nothing;

  insert into public.tenants(slug, name, kind, status, base_currency, trial_ends_at)
  values (lower(p_slug), trim(p_name), 'customer', 'trial', upper(p_currency), now() + interval '30 days')
  returning id into v_tenant;

  perform private.seed_tenant_roles(v_tenant);
  insert into public.memberships(tenant_id, user_id, role_id, status)
  select v_tenant, v_user, r.id, 'active' from public.roles r where r.tenant_id = v_tenant and r.key = 'owner';
  insert into public.subscriptions(tenant_id, plan_code, status, seats, trial_ends_at)
  values (v_tenant, 'trial', 'trialing', 5, now() + interval '30 days');
  insert into public.entitlements(tenant_id, product_code, enabled) values
    (v_tenant, 'commercial', true), (v_tenant, 'engage', false), (v_tenant, 'deliver', false);
  update public.profiles set last_tenant_id = v_tenant where user_id = v_user;

  insert into public.audit_log(tenant_id, actor_user_id, action, entity, entity_id, after)
  values (v_tenant, v_user, 'create', 'tenants', v_tenant::text, jsonb_build_object('name', p_name, 'slug', lower(p_slug)));
  return v_tenant;
end $$;

-- ---------------------------------------------------------------- invitations
create or replace function public.invite_member(p_tenant uuid, p_email text, p_role_key text)
returns text language plpgsql security definer set search_path = '' as $$
declare
  v_token text := encode(extensions.gen_random_bytes(24), 'hex');
  v_role uuid;
  v_seats int;
  v_used int;
begin
  if not private.has_perm(p_tenant, 'admin.users') then raise exception 'not allowed' using errcode = '42501'; end if;
  select id into v_role from public.roles where tenant_id = p_tenant and key = p_role_key;
  if v_role is null then raise exception 'unknown role %', p_role_key using errcode = '22023'; end if;
  if p_role_key = 'owner' and private.scope_for(p_tenant, 'admin.billing') is null then
    raise exception 'only an owner can invite an owner' using errcode = '42501';
  end if;
  select seats into v_seats from public.subscriptions where tenant_id = p_tenant;
  select (select count(*) from public.memberships where tenant_id = p_tenant and status in ('active', 'invited'))
       + (select count(*) from public.invitations where tenant_id = p_tenant and accepted_at is null and revoked_at is null and expires_at > now())
    into v_used;
  if v_used >= coalesce(v_seats, 0) then raise exception 'no seats left on this subscription' using errcode = '54000'; end if;

  insert into public.invitations(tenant_id, email, role_id, token_hash, invited_by)
  values (p_tenant, lower(trim(p_email)), v_role, encode(extensions.digest(v_token, 'sha256'), 'hex'), auth.uid());
  insert into public.audit_log(tenant_id, actor_user_id, action, entity, after)
  values (p_tenant, auth.uid(), 'invite', 'memberships', jsonb_build_object('email', lower(trim(p_email)), 'role', p_role_key));
  return v_token;   -- returned once to the server, which e-mails it; only its hash is stored
end $$;

create or replace function public.accept_invitation(p_token text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_inv public.invitations;
  v_email text;
begin
  select lower(email) into v_email from auth.users where id = auth.uid();
  if v_email is null then raise exception 'sign in first' using errcode = '28000'; end if;
  select * into v_inv from public.invitations
   where token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex') for update;
  if v_inv.id is null or v_inv.accepted_at is not null or v_inv.revoked_at is not null or v_inv.expires_at < now() then
    raise exception 'invitation is not valid' using errcode = '22023';
  end if;
  if v_inv.email <> v_email then raise exception 'invitation was sent to a different address' using errcode = '42501'; end if;

  insert into public.profiles(user_id, email) values (auth.uid(), v_email) on conflict (user_id) do nothing;
  insert into public.memberships(tenant_id, user_id, role_id, business_unit_id, status)
  values (v_inv.tenant_id, auth.uid(), v_inv.role_id, v_inv.business_unit_id, 'active')
  on conflict (tenant_id, user_id) do update set role_id = excluded.role_id, status = 'active';
  update public.invitations set accepted_at = now() where tenant_id = v_inv.tenant_id and id = v_inv.id;
  insert into public.audit_log(tenant_id, actor_user_id, action, entity, entity_id)
  values (v_inv.tenant_id, auth.uid(), 'accept_invitation', 'memberships', auth.uid()::text);
  return v_inv.tenant_id;
end $$;

-- ---------------------------------------------------------------- tenant lifecycle (platform admin)
create or replace function public.set_tenant_status(p_tenant uuid, p_status public.tenant_status, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_platform_admin() then raise exception 'platform administrators only' using errcode = '42501'; end if;
  update public.tenants set status = p_status where id = p_tenant;
  insert into public.audit_log(tenant_id, actor_user_id, actor_kind, action, entity, entity_id, after)
  values (p_tenant, auth.uid(), 'platform_admin', 'set_status', 'tenants', p_tenant::text, jsonb_build_object('status', p_status, 'reason', p_reason));
end $$;

-- Data export and deletion requests are queued as jobs and executed by the server worker (service role).
create or replace function public.request_tenant_data_job(p_tenant uuid, p_kind text)
returns bigint language plpgsql security definer set search_path = '' as $$
declare v_id bigint;
begin
  if p_kind not in ('tenant_export', 'tenant_delete') then raise exception 'unknown job' using errcode = '22023'; end if;
  if private.scope_for(p_tenant, 'admin.billing') is null then raise exception 'owners only' using errcode = '42501'; end if;
  insert into public.jobs(tenant_id, kind, payload, run_after)
  values (p_tenant, p_kind, jsonb_build_object('requested_by', auth.uid()),
          case when p_kind = 'tenant_delete' then now() + interval '14 days' else now() end)   -- 14-day cancel window
  returning id into v_id;
  insert into public.audit_log(tenant_id, actor_user_id, action, entity, entity_id) values (p_tenant, auth.uid(), p_kind, 'jobs', v_id::text);
  return v_id;
end $$;

revoke all on function public.create_organization(text, text, char), public.invite_member(uuid, text, text),
  public.accept_invitation(text), public.set_tenant_status(uuid, public.tenant_status, text),
  public.request_tenant_data_job(uuid, text) from public, anon;
grant execute on function public.create_organization(text, text, char), public.invite_member(uuid, text, text),
  public.accept_invitation(text), public.set_tenant_status(uuid, public.tenant_status, text),
  public.request_tenant_data_job(uuid, text) to authenticated;

-- ---------------------------------------------------------------- tenant-scoped storage
-- Bucket 'tenant-documents' (private). Object names start with the tenant id; access follows document permissions.
insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values ('tenant-documents', 'tenant-documents', false, 52428800, array[
  'application/pdf', 'image/png', 'image/jpeg', 'text/csv', 'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'])
on conflict (id) do nothing;

create or replace function private.object_tenant(p_name text) returns uuid language sql immutable as $$
  select case when split_part(p_name, '/', 1) ~ '^[0-9a-f-]{36}$' then split_part(p_name, '/', 1)::uuid end
$$;

create policy tenant_docs_read on storage.objects for select to authenticated
  using (bucket_id = 'tenant-documents' and private.has_perm(private.object_tenant(name), 'document.view'));
create policy tenant_docs_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'tenant-documents' and private.has_perm(private.object_tenant(name), 'document.create'));
create policy tenant_docs_update on storage.objects for update to authenticated
  using (bucket_id = 'tenant-documents' and private.has_perm(private.object_tenant(name), 'document.edit'));
create policy tenant_docs_delete on storage.objects for delete to authenticated
  using (bucket_id = 'tenant-documents' and private.has_perm(private.object_tenant(name), 'document.delete'));

-- Defence in depth: anonymous callers get no table or function access at all (Supabase grants it by default).
revoke all on all tables in schema public from anon;
revoke execute on all functions in schema public from anon;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public revoke execute on functions from anon;
