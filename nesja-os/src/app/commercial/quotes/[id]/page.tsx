import { notFound } from "next/navigation";
import Link from "next/link";
import { asUser } from "@/lib/server/session";
import { many, one } from "@/lib/server/db";
import { Badge, Card, Kpi, Notice, PageHeader } from "@/components/ui/primitives";
import { DataTable } from "@/components/ui/data-table";
import { money, date, label, pct } from "@/lib/format";
import { amortise, D } from "@/lib/finance";
import { QuoteActions } from "./quote-actions";

export const metadata = { title: "Quotation" };
export default async function Quote({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const d = await asUser(async (db, s) => {
    const q = await one<Record<string, string>>(db, `select q.*, qt.one_time_revenue, qt.recurring_revenue, qt.transactional_revenue, qt.gross_revenue, qt.overall_discount, qt.tcv, qt.total_cost, qt.mobilisation_per_month,
      o.name as opportunity, o.id as opp_id, a.name as account from public.quotes q join public.quote_totals qt on qt.tenant_id = q.tenant_id and qt.quote_id = q.id
      join public.opportunities o on o.tenant_id = q.tenant_id and o.id = q.opportunity_id join public.accounts a on a.tenant_id = o.tenant_id and a.id = o.account_id where q.tenant_id = $1 and q.id = $2`, [s.org.id, id]);
    if (!q) return null;
    const lines = await many<Record<string, string>>(db, "select position, description, pricing_model, quantity, unit_price, unit_cost, discount_rate, billing_months, line_revenue, line_cost from public.quote_lines where tenant_id = $1 and quote_id = $2 order by position", [s.org.id, id]);
    const approvals = await many<Record<string, string>>(db, "select kind, reason, status, decided_at from public.approval_requests where tenant_id = $1 and entity_id = $2 order by created_at desc", [s.org.id, id]);
    return { q, lines, approvals, cur: s.org.base_currency, margin: s.can("opportunity.view_margin"), canEdit: s.can("quote.edit") };
  }, "quote.view");
  if (!d) notFound();
  const { q, cur } = d;
  const gm = new D(q.tcv).minus(q.total_cost);
  const gmPct = new D(q.tcv).gt(0) ? gm.dividedBy(q.tcv).toDecimalPlaces(4).toString() : null;
  const sched = amortise(q.mobilisation_cost, Number(q.term_months));
  return (<>
    <PageHeader title={`${q.number} rev ${q.revision}`} subtitle={<><Link href={`/commercial/opportunities/${q.opp_id}`} className="text-link">{q.opportunity}</Link> · {q.account} · <Badge>{label(q.status)}</Badge></>}
      actions={d.canEdit && <QuoteActions id={id} status={q.status} />} />
    {["issued", "accepted", "superseded"].includes(q.status) && <div className="mb-4"><Notice>This revision is locked. Create a new revision to change it.</Notice></div>}
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi label="TCV" value={money(q.tcv, cur)} href="#lines" sub={`${q.term_months} months · discount ${money(q.overall_discount, cur)}`} />
      <Kpi label="Recurring / transactional" value={money(new D(q.recurring_revenue).plus(q.transactional_revenue).toFixed(2), cur)} href="#lines" sub={`One-time ${money(q.one_time_revenue, cur)}`} />
      {d.margin && <Kpi label="Total cost" value={money(q.total_cost, cur)} href="#lines" sub={`Mobilisation ${money(q.mobilisation_per_month, cur)}/month`} />}
      {d.margin && <Kpi label="Gross margin" value={pct(gmPct)} href="#lines" status={gmPct === null ? "none" : new D(gmPct).gte(0.25) ? "on_target" : new D(gmPct).gte(0.2) ? "at_risk" : "off_target"} sub={money(gm.toFixed(2), cur)} />}
    </div>
    <div id="lines" className="mt-4 space-y-4">
      <DataTable rows={d.lines} columns={[{ key: "p", header: "#", cell: (l) => l.position }, { key: "d", header: "Description", cell: (l) => l.description }, { key: "m", header: "Model", cell: (l) => label(l.pricing_model) },
        { key: "q", header: "Qty", align: "end", cell: (l) => l.quantity }, { key: "u", header: "Unit price", align: "end", cell: (l) => money(l.unit_price, cur) }, { key: "dr", header: "Disc.", align: "end", cell: (l) => pct(l.discount_rate) },
        { key: "bm", header: "Months", align: "end", cell: (l) => l.billing_months }, { key: "r", header: "Revenue", align: "end", cell: (l) => money(l.line_revenue, cur) },
        ...(d.margin ? [{ key: "c", header: "Cost", align: "end" as const, cell: (l: Record<string, string>) => money(l.line_cost, cur) }] : [])]} />
      {d.margin && new D(q.mobilisation_cost).gt(0) && <Card title="Mobilisation amortisation"><p className="text-sm text-muted">{money(q.mobilisation_cost, cur)} over {q.term_months} months: {money(sched[0].toFixed(2), cur)} per month; final month {money(sched[sched.length - 1].toFixed(2), cur)} so the schedule adds back exactly.</p></Card>}
      <Card title="Approvals">{d.approvals.length ? <ul className="space-y-1 text-sm">{d.approvals.map((a, i) => <li key={i}><Badge tone={a.status === "approved" ? "ok" : a.status === "rejected" ? "bad" : "warn"}>{label(a.status)}</Badge> {label(a.kind)}: {a.reason} {a.decided_at ? `· ${date(a.decided_at)}` : ""}</li>)}</ul> : <p className="text-sm text-muted">No approvals needed so far.</p>}</Card>
    </div>
  </>);
}
