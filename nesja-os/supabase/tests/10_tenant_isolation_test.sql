-- Tenant isolation, RBAC scope, provisioning, invitation, storage, audit and quote-arithmetic tests.
-- Run with: psql -v ON_ERROR_STOP=1 -f this-file   (scripts/test-db.sh does it on a throwaway cluster)
\set QUIET on
\pset tuples_only on
create schema if not exists test;
create or replace function test.ok(p_cond boolean, p_name text) returns void language plpgsql as $$
begin
  if p_cond is distinct from true then raise exception 'FAIL: %', p_name; end if;
  raise notice 'ok - %', p_name;
end $$;
grant usage on schema test to authenticated;
grant execute on all functions in schema test to authenticated;

-- Users (as superuser, standing in for Supabase Auth sign-up)
insert into auth.users(id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'alice@tenant-a.test'),
  ('00000000-0000-0000-0000-00000000000b', 'bob@tenant-b.test'),
  ('00000000-0000-0000-0000-00000000000c', 'carol@tenant-a.test'),
  ('00000000-0000-0000-0000-00000000000d', 'mallory@nowhere.test');

-- ---------------------------------------------------------------- Alice creates Tenant A
set role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a"}', false);
select public.create_organization('Tenant A Holdings', 'tenant-a') as tenant_a \gset
select test.ok((select count(*) from public.tenants) = 1, 'Alice sees exactly her tenant');
select test.ok((select r.key from public.memberships m join public.roles r on r.tenant_id = m.tenant_id and r.id = m.role_id
                 where m.user_id = auth.uid()) = 'owner', 'creator becomes owner');
select test.ok((select status from public.subscriptions where tenant_id = :'tenant_a') = 'trialing', 'trial subscription created');
select test.ok((select enabled from public.entitlements where tenant_id = :'tenant_a' and product_code = 'commercial'), 'Commercial entitlement on');

insert into public.accounts(tenant_id, number, name, owner_id) values (:'tenant_a', 'A-0001', 'Secret Customer of A', auth.uid())
  returning id as acct_a \gset
insert into public.opportunities(tenant_id, number, name, account_id, tcv, total_cost, probability, term_months, owner_id)
  values (:'tenant_a', 'OPP-A1', 'A deal', :'acct_a', 120000, 90000, 50, 24, auth.uid()) returning id as opp_a \gset
select test.ok((select acv from public.opportunities where id = :'opp_a') = 60000.00, 'ACV = TCV * 12 / term');
select test.ok((select weighted_value from public.opportunities where id = :'opp_a') = 60000.00, 'weighted = TCV * probability');
select test.ok((select gross_margin from public.opportunities where id = :'opp_a') = 30000.00, 'gross margin = TCV - cost');
select test.ok((select count(*) from public.opportunity_stage_history where opportunity_id = :'opp_a') = 1, 'stage history recorded on create');

-- ---------------------------------------------------------------- Bob creates Tenant B
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000b"}', false);
select public.create_organization('Tenant B Group', 'tenant-b') as tenant_b \gset
select test.ok((select count(*) from public.tenants) = 1, 'Bob sees only his tenant');
select test.ok((select count(*) from public.accounts) = 0, 'Bob cannot read Tenant A accounts');
select test.ok((select count(*) from public.opportunities) = 0, 'Bob cannot read Tenant A opportunities');
select test.ok((select count(*) from public.audit_log) = 1, 'Bob reads only his own tenant audit (his create event)');
select test.ok((select count(*) from public.roles where tenant_id = :'tenant_a') = 0, 'Bob cannot read Tenant A roles');

\set ON_ERROR_STOP off
\set QUIET off
-- psql variables do not expand inside DO bodies, so the cross-tenant write is checked with plain statements:
insert into public.accounts(tenant_id, number, name) values (:'tenant_a', 'X-1', 'Injected by Bob');
\set ON_ERROR_STOP on
\set QUIET on
update public.accounts set name = 'Hijacked' where id = :'acct_a';
reset role;
select test.ok((select name from public.accounts where id = :'acct_a') = 'Secret Customer of A', 'Bob update of Tenant A row changed nothing');
select test.ok(not exists (select 1 from public.accounts where number = 'X-1'), 'Bob insert into Tenant A was refused');
set role authenticated;

insert into public.accounts(tenant_id, number, name, owner_id) values (:'tenant_b', 'B-0001', 'B customer', auth.uid()) returning id as acct_b \gset
\set ON_ERROR_STOP off
-- Composite foreign key: Bob cannot attach his opportunity to Tenant A's account even if he knows its id.
insert into public.opportunities(tenant_id, number, name, account_id) values (:'tenant_b', 'OPP-B-X', 'cross ref', :'acct_a');
\set ON_ERROR_STOP on
reset role;
select test.ok(not exists (select 1 from public.opportunities where number = 'OPP-B-X'), 'cross-tenant reference refused by composite FK');
set role authenticated;

-- Storage: Bob cannot read or write objects under Tenant A's prefix.
reset role;
insert into storage.objects(bucket_id, name) values ('tenant-documents', :'tenant_a' || '/doc-1/contract.pdf');
set role authenticated;
select test.ok((select count(*) from storage.objects) = 0, 'Bob cannot list Tenant A files');
\set ON_ERROR_STOP off
insert into storage.objects(bucket_id, name) values ('tenant-documents', :'tenant_a' || '/evil/upload.pdf');
\set ON_ERROR_STOP on
reset role;
select test.ok(not exists (select 1 from storage.objects where name like '%/evil/%'), 'Bob cannot upload into Tenant A storage');
set role authenticated;

-- ---------------------------------------------------------------- Alice invites Carol as Account Manager (own scope)
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a"}', false);
select test.ok((select count(*) from storage.objects) = 1, 'Alice can see Tenant A file');
select public.invite_member(:'tenant_a', 'carol@tenant-a.test', 'account_manager') as carol_token \gset
select test.ok((select count(*) from public.invitations where tenant_id = :'tenant_a') = 1, 'invitation stored');
select test.ok((select token_hash from public.invitations limit 1) <> :'carol_token', 'only the token hash is stored');

-- Mallory cannot use Carol's invitation.
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d"}', false);
\set ON_ERROR_STOP off
select public.accept_invitation(:'carol_token');
\set ON_ERROR_STOP on
select test.ok((select count(*) from public.tenants) = 0, 'Mallory (wrong e-mail) got no access');

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000c"}', false);
select test.ok(public.accept_invitation(:'carol_token') = :'tenant_a'::uuid, 'Carol accepts invitation');
select test.ok((select count(*) from public.accounts) = 0, 'Carol (own scope) does not see Alice''s account');
insert into public.accounts(tenant_id, number, name, owner_id) values (:'tenant_a', 'A-0002', 'Carol customer', auth.uid());
select test.ok((select count(*) from public.accounts) = 1, 'Carol sees her own account');
select test.ok((select count(*) from public.audit_log) = 0, 'Carol (no admin.audit) cannot read the audit log');
\set ON_ERROR_STOP off
select public.accept_invitation(:'carol_token');
\set ON_ERROR_STOP on

select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a"}', false);
select test.ok((select count(*) from public.accounts) = 2, 'Alice (owner, all scope) sees both Tenant A accounts');
select test.ok((select count(*) from public.audit_log where entity = 'accounts') = 2, 'account inserts are audited');

-- ---------------------------------------------------------------- quotes: deterministic totals and locking
insert into public.quotes(tenant_id, number, opportunity_id, term_months, overall_discount_rate, mobilisation_cost, owner_id)
  values (:'tenant_a', 'Q-A1', :'opp_a', 36, 0.05, 18000, auth.uid()) returning id as quote_a \gset
insert into public.quote_lines(tenant_id, quote_id, position, description, pricing_model, quantity, unit_price, unit_cost, discount_rate) values
  (:'tenant_a', :'quote_a', 1, 'Setup', 'one_time', 1, 25000, 15000, 0),
  (:'tenant_a', :'quote_a', 2, 'Service desk agents', 'recurring', 12, 3200, 2350.5, 0.10),
  (:'tenant_a', :'quote_a', 3, 'Tickets', 'transactional', 1500, 1.75, 0.6, 0);
-- recurring: 12*3200*0.9*36 = 1,244,160 ; transactional: 1500*1.75*36 = 94,500 ; one-time 25,000
select test.ok((select gross_revenue from public.quote_totals where quote_id = :'quote_a') = 1363660.00, 'gross revenue across pricing models');
select test.ok((select overall_discount from public.quote_totals where quote_id = :'quote_a') = 68183.00, 'overall discount 5%');
select test.ok((select tcv from public.quote_totals where quote_id = :'quote_a') = 1295477.00, 'quote TCV');
-- cost: 15000 + 12*2350.5*36 (1,015,416) + 1500*0.6*36 (32,400) + mobilisation 18,000
select test.ok((select total_cost from public.quote_totals where quote_id = :'quote_a') = 1080816.00, 'quote cost incl. mobilisation');
select test.ok((select mobilisation_per_month from public.quote_totals where quote_id = :'quote_a') = 500.00, 'mobilisation amortised monthly');

update public.quotes set status = 'issued', issued_at = now() where id = :'quote_a';
\set ON_ERROR_STOP off
update public.quotes set overall_discount_rate = 0.2 where id = :'quote_a';
update public.quote_lines set unit_price = 1 where quote_id = :'quote_a' and position = 1;
\set ON_ERROR_STOP on
select test.ok((select overall_discount_rate from public.quotes where id = :'quote_a') = 0.05, 'issued quote header locked');
select test.ok((select unit_price from public.quote_lines where quote_id = :'quote_a' and position = 1) = 25000, 'issued quote lines locked');

-- ---------------------------------------------------------------- approvals: segregation of duties
\set ON_ERROR_STOP off
insert into public.approval_requests(tenant_id, kind, entity, entity_id, reason, status, requested_by, approver_id, decided_at)
  values (:'tenant_a', 'margin', 'quote', :'quote_a', 'self approval', 'approved', auth.uid(), auth.uid(), now());
\set ON_ERROR_STOP on
select test.ok(not exists (select 1 from public.approval_requests where reason = 'self approval'), 'requester cannot approve own request');

-- ---------------------------------------------------------------- audit log is append-only
\set ON_ERROR_STOP off
reset role;
update public.audit_log set action = 'tampered';
delete from public.audit_log;
\set ON_ERROR_STOP on
select test.ok(not exists (select 1 from public.audit_log where action = 'tampered') and (select count(*) from public.audit_log) > 0, 'audit log append-only even for the owner role');

-- ---------------------------------------------------------------- suspension removes access
update public.tenants set status = 'suspended' where id = :'tenant_a';
set role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a"}', false);
select test.ok((select count(*) from public.accounts) = 0, 'suspended tenant: members see no records');
reset role;
update public.tenants set status = 'active' where id = :'tenant_a';

-- ---------------------------------------------------------------- abuse protection on organization creation
set role authenticated;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000d"}', false);
select public.create_organization('M1', 'm-one'); select public.create_organization('M2', 'm-two'); select public.create_organization('M3', 'm-three');
\set ON_ERROR_STOP off
select public.create_organization('M4', 'm-four');
\set ON_ERROR_STOP on
reset role;
select test.ok(not exists (select 1 from public.tenants where slug = 'm-four'), 'fourth organization in 24h refused');

-- ---------------------------------------------------------------- anonymous gets nothing
select test.ok(not has_table_privilege('anon', 'public.accounts', 'select') and not has_table_privilege('anon', 'public.tenants', 'select'), 'anon has no table privilege');
select test.ok(not has_function_privilege('anon', 'public.create_organization(text, text, char)', 'execute'), 'anon cannot call provisioning');
select 'ALL TENANT ISOLATION TESTS PASSED';
