import { notFound } from "next/navigation";
import Link from "next/link";
import { asUser } from "@/lib/server/session";
import { many, one } from "@/lib/server/db";
import { Badge, Card, Kpi, PageHeader } from "@/components/ui/primitives";
import { BarChart } from "@/components/ui/charts";
import { money, date, label, pct } from "@/lib/format";
import { D, sum } from "@/lib/finance";
export const metadata = { title: "Agreement" };
export default async function Agreement({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const d = await asUser(async (db, s) => {
    const g = await one<Record<string, string>>(db, `select g.*, a.name as account, o.name as opportunity, o.total_cost as planned_cost, o.tcv as planned_tcv from public.agreements g join public.accounts a on a.tenant_id = g.tenant_id and a.id = g.account_id
      left join public.opportunities o on o.tenant_id = g.tenant_id and o.id = g.opportunity_id where g.tenant_id = $1 and g.id = $2`, [s.org.id, id]);
    if (!g) return null;
    const actuals = s.can("finance.view") ? await many<{ m: string; revenue: string; cost: string; budget_revenue: string }>(db, "select to_char(period_month,'YYYY-MM') as m, revenue, cost, budget_revenue from public.financial_actuals where tenant_id = $1 and agreement_id = $2 order by period_month", [s.org.id, id]) : [];
    const ren = await many<Record<string, string>>(db, "select due_date, current_value, proposed_value, risk, status from public.renewals where tenant_id = $1 and agreement_id = $2", [s.org.id, id]);
    return { g, actuals, ren, cur: s.org.base_currency, margin: s.can("opportunity.view_margin") };
  }, "agreement.view");
  if (!d) notFound();
  const { g, cur } = d;
  const rev = sum(d.actuals.map((a) => a.revenue)), cost = sum(d.actuals.map((a) => a.cost));
  const actualGm = rev.gt(0) ? rev.minus(cost).dividedBy(rev).toDecimalPlaces(4).toString() : null;
  const planGm = g.planned_tcv && new D(g.planned_tcv).gt(0) ? new D(g.planned_tcv).minus(g.planned_cost).dividedBy(g.planned_tcv).toDecimalPlaces(4).toString() : null;
  const erosion = actualGm && planGm ? new D(planGm).minus(actualGm) : null;
  return (<>
    <PageHeader title={g.title} subtitle={<>{g.number} · {g.type.toUpperCase()} · <Link href={`/commercial/accounts/${g.account_id}`} className="text-link">{g.account}</Link> · <Badge>{label(g.status)}</Badge></>} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi label="Contract value" value={money(g.contract_value, cur)} href={g.opportunity_id ? `/commercial/opportunities/${g.opportunity_id}` : "#"} sub={`${date(g.start_date)} – ${date(g.end_date)}`} />
      <Kpi label="Billed to date" value={money(rev.toFixed(2), cur)} href={`/commercial/performance?agreement=${id}`} sub={`${d.actuals.length} months`} />
      {d.margin && <Kpi label="Actual vs planned margin" value={pct(actualGm)} href={`/commercial/performance?agreement=${id}`} status={erosion === null ? "none" : erosion.lte(0.01) ? "on_target" : erosion.lte(0.04) ? "at_risk" : "off_target"} sub={`Plan ${pct(planGm)}`} />}
      <Kpi label="Renewal" value={d.ren[0] ? label(d.ren[0].status) : g.auto_renew ? "Auto-renews" : "—"} href="/commercial/renewals" sub={d.ren[0] ? `Due ${date(d.ren[0].due_date)} · risk ${d.ren[0].risk}` : `Notice ${g.notice_days ?? "—"} days`} />
    </div>
    {d.actuals.length > 0 && <Card className="mt-4" title="Monthly revenue: actual vs schedule"><BarChart format={(n) => money(String(n), cur, true)} data={d.actuals.map((a) => ({ label: a.m.slice(2), value: Number(a.revenue), series2: Number(a.budget_revenue) }))} /></Card>}
  </>);
}
