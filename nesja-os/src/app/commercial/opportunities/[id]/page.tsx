import { notFound } from "next/navigation";
import Link from "next/link";
import { asUser } from "@/lib/server/session";
import { many, one } from "@/lib/server/db";
import { Badge, Card, Kpi, PageHeader } from "@/components/ui/primitives";
import { DataTable } from "@/components/ui/data-table";
import { money, date, label, pct } from "@/lib/format";
import { StageControl } from "./stage-control";
import { QuoteBuilder } from "../../quotes/quote-builder";

export const metadata = { title: "Opportunity" };
export default async function Opportunity({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const d = await asUser(async (db, s) => {
    const o = await one<Record<string, string>>(db, `select o.*, a.name as account, p.full_name as owner from public.opportunities o join public.accounts a on a.tenant_id = o.tenant_id and a.id = o.account_id
      left join public.profiles p on p.user_id = o.owner_id where o.tenant_id = $1 and o.id = $2`, [s.org.id, id]);
    if (!o) return null;
    const quotes = await many<Record<string, string>>(db, `select q.id, q.number, q.revision, q.status, qt.tcv, qt.total_cost from public.quotes q join public.quote_totals qt on qt.tenant_id = q.tenant_id and qt.quote_id = q.id
      where q.tenant_id = $1 and q.opportunity_id = $2 order by q.number, q.revision desc`, [s.org.id, id]);
    const history = await many<Record<string, string>>(db, "select h.from_stage, h.to_stage, h.changed_at, p.full_name from public.opportunity_stage_history h left join public.profiles p on p.user_id = h.changed_by where h.tenant_id = $1 and h.opportunity_id = $2 order by h.changed_at desc", [s.org.id, id]);
    const items = await many<{ code: string; description: string; pricing_model: string; unit_price: string; unit_cost: string }>(db, "select i.code, i.description, i.pricing_model, i.unit_price, i.unit_cost from public.rate_card_items i where i.tenant_id = $1 order by i.code", [s.org.id]);
    return { o, quotes, history, items, cur: s.org.base_currency, margin: s.can("opportunity.view_margin"), canEdit: s.can("opportunity.edit"), canQuote: s.can("quote.create") };
  }, "opportunity.view");
  if (!d) notFound();
  const { o, cur } = d;
  const gmPct = Number(o.tcv) > 0 ? String((Number(o.gross_margin) / Number(o.tcv)).toFixed(4)) : null;
  return (<>
    <PageHeader title={o.name} subtitle={<><Link className="text-link" href={`/commercial/accounts/${o.account_id}`}>{o.account}</Link> · {o.number} · {label(o.revenue_type)} · Owner {o.owner ?? "—"}</>}
      actions={d.canEdit && <StageControl id={id} stage={o.stage} />} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <Kpi label="Stage" value={label(o.stage)} href="#history" sub={`Probability ${o.probability}%`} />
      <Kpi label="TCV" value={money(o.tcv, cur)} href="#quotes" sub={`${o.term_months} months`} />
      <Kpi label="ACV" value={money(o.acv, cur)} href="#quotes" />
      <Kpi label="Weighted value" value={money(o.weighted_value, cur)} href="/commercial/opportunities?status=open" />
      {d.margin && <Kpi label="Gross margin" value={money(o.gross_margin, cur)} href="#quotes" status={gmPct === null ? "none" : Number(gmPct) >= 0.25 ? "on_target" : Number(gmPct) >= 0.2 ? "at_risk" : "off_target"} sub={pct(gmPct)} />}
    </div>
    <div className="mt-4 grid gap-4 xl:grid-cols-[2fr_1fr]">
      <div id="quotes" className="space-y-4">
        <Card title="Quotations"><DataTable rows={d.quotes} href={(q) => `/commercial/quotes/${q.id}`} empty="No quotations yet" columns={[
          { key: "n", header: "Quote", cell: (q) => `${q.number} rev ${q.revision}` }, { key: "s", header: "Status", cell: (q) => <Badge tone={q.status === "accepted" ? "ok" : q.status === "rejected" ? "bad" : "info"}>{label(q.status)}</Badge> },
          { key: "t", header: "TCV", align: "end", cell: (q) => money(q.tcv, cur) }, ...(d.margin ? [{ key: "c", header: "Cost", align: "end" as const, cell: (q: Record<string, string>) => money(q.total_cost, cur) }] : [])]} /></Card>
        {d.canQuote && !o.stage.startsWith("closed") && <Card title="New quotation (CPQ)"><QuoteBuilder opportunityId={id} currency={cur} termMonths={Number(o.term_months)} catalogue={d.items} showCost={d.margin} /></Card>}
      </div>
      <Card title="Stage history"><ol id="history" className="space-y-2 text-sm">{d.history.map((h, i) => <li key={i}><span className="font-medium">{label(h.to_stage)}</span><span className="text-muted"> · {date(h.changed_at)}{h.full_name ? ` · ${h.full_name}` : ""}</span></li>)}</ol></Card>
    </div>
  </>);
}
