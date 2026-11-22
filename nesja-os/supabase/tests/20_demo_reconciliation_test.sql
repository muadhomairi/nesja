-- Demo dataset: required counts and financial reconciliation (run after demo-output/northstar.sql is loaded).
\set QUIET on
\pset tuples_only on
\set t '4e000000-0000-4000-8000-000000000001'
select test.ok((select kind from public.tenants where id = :'t') = 'demo', 'Northstar is a demo tenant');
select test.ok((select count(*) from public.accounts where tenant_id = :'t') >= 150, '150 accounts');
select test.ok((select count(*) from public.contacts where tenant_id = :'t') >= 500, '500 contacts');
select test.ok((select count(*) from public.leads where tenant_id = :'t') >= 350, '350 leads');
select test.ok((select count(*) from public.opportunities where tenant_id = :'t') >= 250, '250 opportunities');
select test.ok((select count(*) from public.quotes where tenant_id = :'t') >= 180, '180 quotations');
select test.ok((select count(*) from public.tenders where tenant_id = :'t') >= 60, '60 tenders');
select test.ok((select count(*) from public.agreements where tenant_id = :'t') >= 120, '120 agreements');
select test.ok((select count(*) from public.renewals where tenant_id = :'t') >= 80, '80 renewals');
select test.ok((select count(*) from public.activities where tenant_id = :'t') >= 2000, '2,000 activities');
select test.ok((select count(distinct period_month) from public.financial_actuals where tenant_id = :'t') = 24, '24 months of actuals');
select test.ok((select count(*) from public.memberships where tenant_id = :'t' and status = 'active') >= 60, '60 demo users');
select test.ok((select count(*) from public.approval_requests where tenant_id = :'t') >= 150, '150 approvals');
select test.ok((select count(*) from public.notifications where tenant_id = :'t') >= 500, '500 notifications');
select test.ok((select count(*) from public.documents where tenant_id = :'t') >= 300, '300 document records');
select test.ok((select count(*) from public.demo_journeys where tenant_id = :'t') = 6, 'six demonstration journeys');
select test.ok((select count(distinct currency) from public.opportunities where tenant_id = :'t') = 1
  and (select min(currency) from public.opportunities where tenant_id = :'t') = 'USD', 'all opportunities in USD');

-- Reconciliation
select test.ok(not exists (
  select 1 from public.opportunities o join public.quote_totals qt on qt.tenant_id = o.tenant_id
  join public.quotes q on q.tenant_id = o.tenant_id and q.id = qt.quote_id and q.opportunity_id = o.id
  where o.tenant_id = :'t' and (o.tcv <> qt.tcv or o.total_cost <> qt.total_cost)), 'every quoted opportunity equals its quote TCV and cost to the cent');
select test.ok(not exists (
  select 1 from public.agreements a join public.opportunities o on o.tenant_id = a.tenant_id and o.id = a.opportunity_id
  where a.tenant_id = :'t' and a.contract_value <> o.tcv), 'agreement value equals won opportunity TCV');
select test.ok(not exists (
  select 1 from public.agreements a join public.opportunities o on o.tenant_id = a.tenant_id and o.id = a.opportunity_id
  where a.tenant_id = :'t' and o.stage <> 'closed_won'), 'valued agreements come only from won opportunities');
select test.ok((select count(*) from public.quotes q join public.opportunities o on o.tenant_id = q.tenant_id and o.id = q.opportunity_id
  where q.tenant_id = :'t' and q.status = 'accepted' and o.stage <> 'closed_won') = 0, 'accepted quotes belong to won opportunities');
select test.ok(not exists (
  select 1 from public.financial_actuals f join public.agreements a on a.tenant_id = f.tenant_id and a.id = f.agreement_id
  where f.tenant_id = :'t' and (f.period_month < date_trunc('month', a.start_date) or f.period_month > a.end_date)), 'actuals fall inside agreement dates');
select test.ok(not exists (
  select a.id from public.agreements a join public.financial_actuals f on f.tenant_id = a.tenant_id and f.agreement_id = a.id
  where a.tenant_id = :'t' group by a.id, a.contract_value having sum(f.budget_revenue) > a.contract_value + 1), 'budgeted actuals never exceed contract value');
select test.ok(not exists (
  select 1 from public.renewals r join public.agreements a on a.tenant_id = r.tenant_id and a.id = r.agreement_id
  join public.opportunities o on o.tenant_id = a.tenant_id and o.id = a.opportunity_id
  where r.tenant_id = :'t' and r.current_value <> round(a.contract_value * 12 / o.term_months, 2)), 'renewal current value = annualised contract value');
select test.ok(not exists (select 1 from public.approval_requests where tenant_id = :'t' and approver_id = requested_by), 'no self-approvals in demo data');
select test.ok(exists (select 1 from public.financial_actuals f join public.agreements a on a.tenant_id = f.tenant_id and a.id = f.agreement_id
  join public.opportunities o on o.tenant_id = a.tenant_id and o.id = a.opportunity_id
  where f.tenant_id = :'t' group by a.id, o.tcv, o.total_cost having sum(f.cost) / nullif(sum(f.revenue), 0) > o.total_cost / o.tcv * 1.08), 'low-margin recovery scenario present');
select test.ok(not exists (select 1 from public.documents where tenant_id = :'t' and split_part(storage_path, '/', 1) <> tenant_id::text), 'documents stored under the tenant prefix');
-- Demo data never leaks into a customer tenant
select test.ok(not exists (select 1 from public.accounts a join public.tenants t on t.id = a.tenant_id where a.is_demo and t.kind <> 'demo'), 'no demo records in customer tenants');

-- Demo user isolation: a Northstar account manager sees only own records; a Tenant A owner sees no Northstar data.
select (select json_build_object('sub', m.user_id)::text from public.memberships m join public.roles r on r.tenant_id = m.tenant_id and r.id = m.role_id
  where m.tenant_id = :'t' and r.key = 'account_manager' and exists (select 1 from public.opportunities o where o.tenant_id = m.tenant_id and o.owner_id = m.user_id)
  order by m.user_id limit 1) as am_claims \gset
set role authenticated;
select set_config('request.jwt.claims', :'am_claims', false);
select test.ok((select count(*) from public.opportunities) between 1 and 249 and not exists (select 1 from public.opportunities where owner_id <> auth.uid()), 'demo account manager sees only own opportunities');
select set_config('request.jwt.claims', '{"sub":"00000000-0000-0000-0000-00000000000a"}', false);
select test.ok((select count(*) from public.opportunities where tenant_id = :'t') = 0, 'other tenants see no Northstar data');
reset role;

-- Demo → live conversion copies configuration only
select (select json_build_object('sub', m.user_id)::text from public.memberships m join public.roles r on r.tenant_id = m.tenant_id and r.id = m.role_id
  where m.tenant_id = :'t' and r.key = 'owner' limit 1) as owner_claims \gset
set role authenticated;
select set_config('request.jwt.claims', :'owner_claims', false);
select public.convert_demo_to_live(:'t', 'Northstar Live Pilot', 'northstar-live') as live \gset
reset role;
select test.ok((select count(*) from public.resource_roles where tenant_id = :'live') = 6 and (select count(*) from public.business_units where tenant_id = :'live') = 4, 'conversion keeps configuration');
select test.ok((select count(*) from public.accounts where tenant_id = :'live') = 0 and (select count(*) from public.opportunities where tenant_id = :'live') = 0, 'conversion excludes demo records');
select test.ok((select kind from public.tenants where id = :'live') = 'customer', 'converted tenant is a customer tenant');
select 'ALL DEMO RECONCILIATION TESTS PASSED';
