-- Data-quality rules, financial reconciliation and forecast layers (concepts ported from Commercial Hub V1.4.3.02
-- and V1.4.2.8, rebuilt tenant-aware). All views are security_invoker, so RLS limits them to what the caller may see.

create view public.data_quality_issues with (security_invoker = true) as
select o.tenant_id, 'opportunity'::text as module, 'high'::text as severity, 'missing_owner'::text as rule,
  'Opportunity has no owner'::text as message, o.id as entity_id, o.name as entity_label, '/commercial/opportunities/' || o.id as link, o.created_at as since
from public.opportunities o where o.owner_id is null
union all
select o.tenant_id, 'opportunity', 'medium', 'overdue_close', 'Expected close date has passed but the opportunity is still open',
  o.id, o.name, '/commercial/opportunities/' || o.id, o.expected_close::timestamptz
from public.opportunities o where o.stage not in ('closed_won', 'closed_lost') and o.expected_close < current_date
union all
select o.tenant_id, 'opportunity', 'high', 'won_without_agreement', 'Closed Won without an agreement',
  o.id, o.name, '/commercial/opportunities/' || o.id, o.closed_at
from public.opportunities o where o.stage = 'closed_won'
  and not exists (select 1 from public.agreements g where g.tenant_id = o.tenant_id and g.opportunity_id = o.id)
union all
select o.tenant_id, 'opportunity', 'medium', 'late_stage_without_quote', 'Proposal or negotiation stage without a quotation',
  o.id, o.name, '/commercial/opportunities/' || o.id, o.updated_at
from public.opportunities o where o.stage in ('proposal', 'negotiation')
  and not exists (select 1 from public.quotes q where q.tenant_id = o.tenant_id and q.opportunity_id = o.id)
union all
select a.tenant_id, 'account', 'low', 'account_without_contact', 'Account has no contact',
  a.id, a.name, '/commercial/accounts/' || a.id, a.created_at
from public.accounts a where a.archived_at is null
  and not exists (select 1 from public.contacts c where c.tenant_id = a.tenant_id and c.account_id = a.id)
union all
select g.tenant_id, 'contract', 'critical', 'active_after_end', 'Agreement is marked active but its end date has passed',
  g.id, g.title, '/commercial/agreements/' || g.id, g.end_date::timestamptz
from public.agreements g where g.status = 'active' and g.end_date < current_date
union all
select g.tenant_id, 'contract', 'high', 'expiring_without_renewal', 'Agreement ends within 120 days and has no renewal record',
  g.id, g.title, '/commercial/agreements/' || g.id, g.end_date::timestamptz
from public.agreements g where g.status = 'active' and g.contract_value is not null and g.end_date between current_date and current_date + 120
  and not exists (select 1 from public.renewals r where r.tenant_id = g.tenant_id and r.agreement_id = g.id)
union all
select q.tenant_id, 'quotation', 'medium', 'expired_open_quote', 'Quotation validity has passed while still issued',
  q.id, q.number || ' rev ' || q.revision, '/commercial/quotes/' || q.id, q.valid_until::timestamptz
from public.quotes q where q.status = 'issued' and q.valid_until < current_date;

-- Reconciliation: each check compares a source figure with the figure it should equal.
create view public.reconciliation_checks with (security_invoker = true) as
select o.tenant_id, 'opportunity_vs_quote'::text as check_key, 'Opportunity TCV equals its accepted quotation'::text as label,
  o.id as entity_id, o.name as entity_label, '/commercial/opportunities/' || o.id as link,
  o.tcv as source_value, qt.tcv as comparison_value,
  case when qt.tcv is null then 'incomplete' when o.tcv = qt.tcv then 'reconciled' else 'discrepancy' end as status
from public.opportunities o
left join lateral (select q.id from public.quotes q where q.tenant_id = o.tenant_id and q.opportunity_id = o.id and q.status = 'accepted' order by q.revision desc limit 1) aq on true
left join public.quote_totals qt on qt.tenant_id = o.tenant_id and qt.quote_id = aq.id
where o.stage = 'closed_won'
union all
select g.tenant_id, 'agreement_vs_opportunity', 'Agreement value equals the won opportunity TCV', g.id, g.title, '/commercial/agreements/' || g.id,
  g.contract_value, o.tcv, case when g.contract_value is null or o.tcv is null then 'incomplete' when g.contract_value = o.tcv then 'reconciled' else 'discrepancy' end
from public.agreements g join public.opportunities o on o.tenant_id = g.tenant_id and o.id = g.opportunity_id
union all
select g.tenant_id, 'billing_vs_contract', 'Scheduled billing to date does not exceed contract value', g.id, g.title, '/commercial/agreements/' || g.id,
  s.budget, g.contract_value, case when g.contract_value is null then 'incomplete' when s.budget <= g.contract_value + 0.01 then 'reconciled' else 'discrepancy' end
from public.agreements g join (select tenant_id, agreement_id, sum(budget_revenue) as budget from public.financial_actuals group by 1, 2) s
  on s.tenant_id = g.tenant_id and s.agreement_id = g.id;

-- Forecast layers per month: contracted recurring revenue (active agreements, straight-line) and the open pipeline
-- split into commit (negotiation), best case (proposal) and weighted pipeline, each month taken from one layer only.
create view public.forecast_months with (security_invoker = true) as
with months as (select generate_series(date_trunc('month', current_date), date_trunc('month', current_date) + interval '11 months', interval '1 month')::date as m)
select g.tenant_id, months.m as period_month, 'contracted'::text as layer, round(sum(g.contract_value / greatest(1, (extract(year from age(g.end_date + 1, g.start_date)) * 12 + extract(month from age(g.end_date + 1, g.start_date)))::int)), 2) as amount
from public.agreements g join months on months.m between date_trunc('month', g.start_date) and g.end_date
where g.status = 'active' and g.contract_value is not null and g.start_date is not null and g.end_date is not null
group by g.tenant_id, months.m
union all
select o.tenant_id, months.m, case o.stage when 'negotiation' then 'commit' when 'proposal' then 'best_case' else 'pipeline' end,
  round(sum(o.weighted_value / o.term_months), 2)
from public.opportunities o join months on months.m >= date_trunc('month', o.expected_close) and months.m < date_trunc('month', o.expected_close) + make_interval(months => o.term_months)
where o.stage not in ('closed_won', 'closed_lost') and o.expected_close is not null
group by o.tenant_id, months.m, 3;

grant select on public.data_quality_issues, public.reconciliation_checks, public.forecast_months to authenticated;
revoke all on public.data_quality_issues, public.reconciliation_checks, public.forecast_months from anon;
