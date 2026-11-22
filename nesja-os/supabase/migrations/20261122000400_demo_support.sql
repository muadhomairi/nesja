-- Demonstration support. Demo records live ONLY in tenants of kind 'demo'; live customer tenants never receive them.

create table public.demo_journeys (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  key text not null,
  position int not null,
  title text not null,
  summary text not null,
  steps jsonb not null,                     -- [{ "label": "...", "href": "/commercial/..." }]
  primary key (tenant_id, key)
);
alter table public.demo_journeys enable row level security;
create policy demo_journeys_read on public.demo_journeys for select to authenticated using (private.is_member(tenant_id));
grant select on public.demo_journeys to authenticated;
revoke all on public.demo_journeys from anon;

create or replace function private.only_demo_tenant() returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if (select kind from public.tenants where id = new.tenant_id) <> 'demo' then
    raise exception 'demo journeys can only be added to a demo tenant' using errcode = '42501';
  end if;
  return new;
end $$;
create trigger demo_journeys_demo_only before insert or update on public.demo_journeys
  for each row execute function private.only_demo_tenant();

-- Demo → live: a new customer tenant that copies configuration (business units, roles, rate cards, resource roles)
-- from a demo tenant the caller belongs to. Business records are NOT copied.
create or replace function public.convert_demo_to_live(p_demo_tenant uuid, p_name text, p_slug text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare v_new uuid;
begin
  if (select kind from public.tenants where id = p_demo_tenant) <> 'demo' or not private.is_member(p_demo_tenant) then
    raise exception 'not a demo organization you belong to' using errcode = '42501';
  end if;
  v_new := public.create_organization(p_name, p_slug, 'USD');
  update public.tenants set converted_from_tenant_id = p_demo_tenant where id = v_new;
  insert into public.business_units(tenant_id, name) select v_new, name from public.business_units where tenant_id = p_demo_tenant;
  insert into public.resource_roles(tenant_id, name, currency, monthly_base_salary, monthly_allowances, employer_cost_rate, annual_one_off_costs)
    select v_new, name, currency, monthly_base_salary, monthly_allowances, employer_cost_rate, annual_one_off_costs
    from public.resource_roles where tenant_id = p_demo_tenant;
  insert into public.rate_cards(tenant_id, name, currency, valid_from, valid_to, target_margin)
    select v_new, name, currency, valid_from, valid_to, target_margin from public.rate_cards where tenant_id = p_demo_tenant;
  insert into public.audit_log(tenant_id, actor_user_id, action, entity, entity_id, after)
  values (v_new, auth.uid(), 'convert_from_demo', 'tenants', v_new::text, jsonb_build_object('demo_tenant', p_demo_tenant));
  return v_new;
end $$;
revoke all on function public.convert_demo_to_live(uuid, text, text) from public, anon;
grant execute on function public.convert_demo_to_live(uuid, text, text) to authenticated;
