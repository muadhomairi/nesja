import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { DataTable } from "@/components/ui/data-table";
import { BarChart } from "@/components/ui/charts";
import { ButtonLink, Card, Kpi, PageHeader } from "@/components/ui/primitives";
import { money } from "@/lib/format";
import { D, sum } from "@/lib/finance";

const LAYERS = [["contracted", "Contracted"], ["commit", "Commit"], ["best_case", "Best case"], ["pipeline", "Weighted pipeline"]] as const;
type Row = { period_month: string; label: string; layer: string; amount: string };

export const metadata = { title: "Revenue forecast" };
export default async function Forecast() {
  const d = await asUser(async (db, s) => ({
    cur: s.org.base_currency, canExport: s.can("data.export"),
    rows: await many<Row>(db, "select to_char(period_month, 'YYYY-MM') as period_month, to_char(period_month, 'Mon YY') as label, layer, amount from public.forecast_months where tenant_id = $1 order by 1", [s.org.id]),
  }), "report.view");
  const months = [...new Map(d.rows.map((r) => [r.period_month, r.label])).entries()];
  const at = (m: string, l: string) => d.rows.find((r) => r.period_month === m && r.layer === l)?.amount ?? "0";
  const layerTotal = (l: string) => sum(d.rows.filter((r) => r.layer === l).map((r) => r.amount));
  const table = months.map(([m, lbl]) => ({ m, lbl, ...Object.fromEntries(LAYERS.map(([k]) => [k, at(m, k)])), total: sum(LAYERS.map(([k]) => at(m, k))).toFixed(2) })) as ({ m: string; lbl: string; total: string } & Record<string, string>)[];
  const totals = Object.fromEntries(LAYERS.map(([k]) => [k, layerTotal(k)]));
  const all = sum(Object.values(totals));
  return (<>
    <PageHeader title="Revenue forecast" subtitle="Next 12 months. Contracted revenue is straight-lined from active agreements; open pipeline is spread over each opportunity's term from its expected close, weighted by probability."
      actions={d.canExport ? <ButtonLink variant="secondary" href="/api/export/forecast">Export CSV</ButtonLink> : undefined} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {LAYERS.map(([k, l]) => <Kpi key={k} label={l} value={money(totals[k].toFixed(2), d.cur, true)} href={k === "contracted" ? "/commercial/agreements" : (k === "commit" ? "/commercial/opportunities?stage=negotiation" : k === "best_case" ? "/commercial/opportunities?stage=proposal" : "/commercial/opportunities?status=open")}
        sub={all.gt(0) ? `${totals[k].dividedBy(all).times(100).toFixed(1)}% of the 12-month view` : undefined} />)}
    </div>
    <Card title="Monthly forecast (contracted vs. contracted plus pipeline)" className="mt-4">
      {months.length ? <BarChart data={table.map((r) => ({ label: r.lbl, value: Number(r.contracted), series2: Number(r.total) }))} format={(n) => money(n.toFixed(2), d.cur, true)} />
        : <p className="text-sm text-muted">No active agreements or open opportunities with an expected close date yet.</p>}
      <p className="mt-2 text-xs text-muted">Solid bars: contracted. Faded bars: contracted plus commit, best case and weighted pipeline.</p>
    </Card>
    <div className="mt-4">
      <DataTable rows={table} empty="Nothing to forecast yet." columns={[
        { key: "m", header: "Month", cell: (r) => r.lbl },
        ...LAYERS.map(([k, l]) => ({ key: k, header: l, align: "end" as const, cell: (r: (typeof table)[number]) => money(r[k], d.cur) })),
        { key: "t", header: "Total", align: "end", cell: (r) => <b>{money(r.total, d.cur)}</b> }]}
        footer={table.length ? <tr><td className="px-3 py-2">12 months</td>{LAYERS.map(([k]) => <td key={k} className="px-3 py-2 text-end tabular">{money(totals[k].toFixed(2), d.cur)}</td>)}<td className="px-3 py-2 text-end tabular">{money(new D(all).toFixed(2), d.cur)}</td></tr> : undefined} />
    </div>
  </>);
}
