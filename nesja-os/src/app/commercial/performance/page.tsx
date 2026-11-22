import Link from "next/link";
import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { Card, Kpi, PageHeader } from "@/components/ui/primitives";
import { ExportButton } from "@/components/ui/export-button";
import { DataTable } from "@/components/ui/data-table";
import { BarChart } from "@/components/ui/charts";
import { money, pct } from "@/lib/format";
import { D, sum, type Dec } from "@/lib/finance";

type Agg = { key: string; name: string; revenue: string; cost: string; budget: string };
export const metadata = { title: "MIS & performance" };
export default async function Performance({ searchParams }: { searchParams: Promise<{ month?: string; unit?: string; account?: string; agreement?: string }> }) {
  const sp = await searchParams;
  const month = /^\d{4}-\d{2}$/.test(sp.month ?? "") ? `${sp.month}-01` : null;
  const uuid = (v?: string) => (v && /^[0-9a-f-]{36}$/.test(v) ? v : null);
  const f = [month, uuid(sp.unit), uuid(sp.account), uuid(sp.agreement)];
  const where = `f.tenant_id = $1 and ($2::date is null or f.period_month = $2) and ($3::uuid is null or f.business_unit_id = $3) and ($4::uuid is null or f.account_id = $4) and ($5::uuid is null or f.agreement_id = $5)`;
  const d = await asUser(async (db, s) => ({
    cur: s.org.base_currency,
    months: await many<Agg>(db, `select to_char(f.period_month,'YYYY-MM') as key, to_char(f.period_month,'Mon YY') as name, sum(revenue) as revenue, sum(cost) as cost, sum(budget_revenue) as budget from public.financial_actuals f where ${where.replace("($2::date is null or f.period_month = $2)", "($2::date is null or true)")} group by 1,2 order by 1`, [s.org.id, ...f]),
    units: await many<Agg>(db, `select f.business_unit_id::text as key, coalesce(b.name,'Unassigned') as name, sum(revenue) as revenue, sum(cost) as cost, sum(budget_revenue) as budget from public.financial_actuals f left join public.business_units b on b.tenant_id = f.tenant_id and b.id = f.business_unit_id where ${where} group by 1,2 order by 3 desc`, [s.org.id, ...f]),
    accounts: await many<Agg>(db, `select f.account_id::text as key, a.name, sum(revenue) as revenue, sum(cost) as cost, sum(budget_revenue) as budget from public.financial_actuals f join public.accounts a on a.tenant_id = f.tenant_id and a.id = f.account_id where ${where} group by 1,2 order by (sum(revenue) - sum(budget_revenue)) limit 25`, [s.org.id, ...f]),
  }), "finance.view");
  const tot = (rows: Agg[]) => ({ revenue: sum(rows.map((r) => r.revenue)), cost: sum(rows.map((r) => r.cost)), budget: sum(rows.map((r) => r.budget)) });
  const ytdRows = d.months.filter((m) => m.key.startsWith(String(new Date().getUTCFullYear())));
  const ytd = tot(ytdRows); const scope = tot(d.units);
  const gm = (r: { revenue: Dec; cost: Dec }) => (r.revenue.gt(0) ? r.revenue.minus(r.cost).dividedBy(r.revenue).toDecimalPlaces(4).toString() : null);
  const base = new URLSearchParams(Object.entries(sp).filter(([, v]) => v) as [string, string][]);
  const link = (k: string, v: string) => { const p = new URLSearchParams(base); p.set(k, v); return `?${p}`; };
  const cols = [
    { key: "n", header: "Name", cell: (r: Agg) => r.name }, { key: "r", header: "Revenue", align: "end" as const, cell: (r: Agg) => money(r.revenue, d.cur) },
    { key: "b", header: "Budget", align: "end" as const, cell: (r: Agg) => money(r.budget, d.cur) },
    { key: "v", header: "Variance", align: "end" as const, cell: (r: Agg) => { const v = new D(r.revenue).minus(r.budget); return <span className={v.isNegative() ? "text-bad" : "text-ok"}>{money(v.toFixed(2), d.cur)}</span>; } },
    { key: "g", header: "GM %", align: "end" as const, cell: (r: Agg) => pct(gm({ revenue: new D(r.revenue), cost: new D(r.cost) })) }];
  return (<>
    <PageHeader title="MIS & performance" actions={<ExportButton entity="actuals" />} subtitle={<>Monthly actuals, YTD and budget variance. Filters: {month ? sp.month : "all months"}{sp.unit ? " · unit" : ""}{sp.account ? " · account" : ""}{sp.agreement ? " · agreement" : ""} {base.toString() && <Link href="/commercial/performance" className="text-link">clear</Link>}</>} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi label="Revenue YTD" value={money(ytd.revenue.toFixed(2), d.cur, true)} href="#months" status={ytd.revenue.gte(ytd.budget) ? "on_target" : ytd.revenue.gte(ytd.budget.times(0.95)) ? "at_risk" : "off_target"} sub={`Budget ${money(ytd.budget.toFixed(2), d.cur, true)}`} />
      <Kpi label="Variance YTD" value={money(ytd.revenue.minus(ytd.budget).toFixed(2), d.cur, true)} href="#accounts" />
      <Kpi label="Gross margin YTD" value={pct(gm(ytd))} href="#units" />
      <Kpi label="Revenue in selection" value={money(scope.revenue.toFixed(2), d.cur, true)} href="#units" sub={`GM ${pct(gm(scope))}`} />
    </div>
    <Card className="mt-4" title="Monthly revenue vs budget"><div id="months"><BarChart format={(n) => money(String(n), d.cur, true)} data={d.months.map((m) => ({ label: m.name, value: Number(m.revenue), series2: Number(m.budget), href: link("month", m.key) }))} /></div></Card>
    <div className="mt-4 grid gap-4 xl:grid-cols-2">
      <Card title="By business unit"><div id="units"><DataTable rows={d.units} href={(r) => link("unit", r.key)} columns={cols} /></div></Card>
      <Card title="Largest variances by account"><div id="accounts"><DataTable rows={d.accounts} href={(r) => link("account", r.key)} columns={cols} /></div></Card>
    </div>
  </>);
}
