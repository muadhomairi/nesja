import { asUser } from "@/lib/server/session";
import { many, one } from "@/lib/server/db";
import { Card, Kpi, PageHeader } from "@/components/ui/primitives";
import { BarChart, Funnel } from "@/components/ui/charts";
import { money, pct, label } from "@/lib/format";
import { D } from "@/lib/finance";

export const metadata = { title: "Command center" };
const OPEN = ["prospecting", "qualification", "solution", "proposal", "negotiation"];

export default async function CommandCenter() {
  const d = await asUser(async (db, s) => {
    const t = s.org.id;
    const k = await one<Record<string, string>>(db, `select
        coalesce(sum(tcv) filter (where stage not in ('closed_won','closed_lost')), 0) as pipeline,
        coalesce(sum(weighted_value) filter (where stage not in ('closed_won','closed_lost')), 0) as weighted,
        coalesce(sum(tcv) filter (where stage = 'closed_won' and closed_at >= date_trunc('year', now())), 0) as won_ytd,
        count(*) filter (where stage = 'closed_won' and closed_at >= date_trunc('year', now()))::text as won_n,
        count(*) filter (where stage = 'closed_lost' and closed_at >= date_trunc('year', now()))::text as lost_n
      from public.opportunities where tenant_id = $1`, [t]);
    const fin = s.can("finance.view") ? await one<Record<string, string>>(db, `select coalesce(sum(revenue),0) as rev, coalesce(sum(cost),0) as cost, coalesce(sum(budget_revenue),0) as budget
      from public.financial_actuals where tenant_id = $1 and period_month >= date_trunc('year', now())`, [t]) : null;
    const monthly = s.can("finance.view") ? await many<{ m: string; rev: string; budget: string }>(db, `select to_char(period_month,'YYYY-MM') as m, sum(revenue) as rev, sum(budget_revenue) as budget
      from public.financial_actuals where tenant_id = $1 and period_month > now() - interval '24 months' group by 1 order by 1`, [t]) : [];
    const stages = await many<{ stage: string; v: string; n: number }>(db, `select stage::text, sum(tcv) as v, count(*)::int as n from public.opportunities where tenant_id = $1 and stage = any($2::public.opp_stage[]) group by stage`, [t, OPEN]);
    const ren = s.can("renewal.view") ? await one<{ n: number; v: string }>(db, `select count(*)::int as n, coalesce(sum(current_value),0) as v from public.renewals where tenant_id = $1 and status in ('upcoming','in_progress') and due_date < now() + interval '180 days'`, [t]) : null;
    const appr = s.can("approval.view") ? await one<{ n: number }>(db, "select count(*)::int as n from public.approval_requests where tenant_id = $1 and status = 'pending'", [t]) : null;
    return { k: k!, fin, monthly, stages, ren, appr, cur: s.org.base_currency, canFin: s.can("finance.view") };
  }, "report.view");
  const winRate = Number(d.k.won_n) + Number(d.k.lost_n) > 0 ? new D(d.k.won_n).dividedBy(Number(d.k.won_n) + Number(d.k.lost_n)).toString() : null;
  const gm = d.fin && new D(d.fin.rev).gt(0) ? new D(d.fin.rev).minus(d.fin.cost).dividedBy(d.fin.rev).toString() : null;
  const variance = d.fin ? new D(d.fin.rev).minus(d.fin.budget) : null;
  const c = d.cur;
  return (
    <>
      <PageHeader title="Commercial command center" subtitle="Live figures, limited to what your role may see. Select any figure to see the records behind it." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Open pipeline (TCV)" value={money(d.k.pipeline, c, true)} href="/commercial/opportunities?status=open" sub={`Weighted ${money(d.k.weighted, c, true)}`} />
        <Kpi label="Won this year" value={money(d.k.won_ytd, c, true)} href="/commercial/opportunities?stage=closed_won&period=ytd" sub={`${d.k.won_n} won · win rate ${pct(winRate, 0)}`} />
        {d.fin && <Kpi label="Revenue YTD vs budget" value={money(d.fin.rev, c, true)} href="/commercial/performance" status={variance!.gte(0) ? "on_target" : variance!.gte(new D(d.fin.budget).times(-0.05)) ? "at_risk" : "off_target"} sub={`Budget ${money(d.fin.budget, c, true)} · variance ${money(variance!.toFixed(2), c, true)}`} />}
        {d.fin && <Kpi label="Gross margin YTD" value={pct(gm)} href="/commercial/performance?view=margin" status={gm === null ? "none" : new D(gm).gte(0.25) ? "on_target" : new D(gm).gte(0.2) ? "at_risk" : "off_target"} sub="Target 25%" />}
        {d.ren && <Kpi label="Renewals due in 180 days" value={String(d.ren.n)} href="/commercial/renewals?window=180" sub={`${money(d.ren.v, c, true)} annual value`} />}
        {d.appr && <Kpi label="Approvals waiting" value={String(d.appr.n)} href="/commercial/approvals?status=pending" />}
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <Card title="Pipeline by stage">
          <Funnel format={(n) => money(String(n), c, true)} stages={OPEN.map((st) => { const r = d.stages.find((x) => x.stage === st); return { label: label(st), value: Number(r?.v ?? 0), count: r?.n ?? 0, href: `/commercial/opportunities?stage=${st}` }; })} />
        </Card>
        {d.canFin && <Card title="Monthly revenue: actual vs budget (24 months)">
          <BarChart format={(n) => money(String(n), c, true)} data={d.monthly.map((m) => ({ label: m.m.slice(2), value: Number(m.rev), series2: Number(m.budget), href: `/commercial/performance?month=${m.m}` }))} />
        </Card>}
      </div>
    </>
  );
}
