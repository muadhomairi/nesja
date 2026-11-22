import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { like, paging, type ListParams } from "@/lib/server/list";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge, PageHeader } from "@/components/ui/primitives";
import { money, date, label } from "@/lib/format";
const ST = ["draft", "submitted", "approved", "rejected", "issued", "accepted", "superseded", "expired"];
export const metadata = { title: "Quotations" };
export default async function Quotes({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams; const pg = paging(sp);
  const { rows, cur, margin } = await asUser(async (db, s) => ({ cur: s.org.base_currency, margin: s.can("opportunity.view_margin"), rows: await many<Record<string, string>>(db, `
    select q.id, q.number, q.revision, q.status, q.term_months, q.valid_until, o.name as opportunity, a.name as account, qt.tcv, qt.total_cost
    from public.quotes q join public.quote_totals qt on qt.tenant_id = q.tenant_id and qt.quote_id = q.id
    join public.opportunities o on o.tenant_id = q.tenant_id and o.id = q.opportunity_id join public.accounts a on a.tenant_id = o.tenant_id and a.id = o.account_id
    where q.tenant_id = $1 and ($2::text is null or q.number ilike $2 or o.name ilike $2 or a.name ilike $2) and ($3::public.quote_status is null or q.status = $3)
    order by q.created_at desc limit $4 offset $5`, [s.org.id, like(sp.q), ST.includes(sp.status ?? "") ? sp.status : null, pg.limit + 1, pg.offset]) }), "quote.view");
  return (<>
    <PageHeader title="Quotations" subtitle="CPQ with one-time, recurring and transactional pricing. Issued revisions are locked." />
    <ListToolbar q={sp.q} page={pg.page} hasMore={rows.length > pg.limit} base={{ q: sp.q, status: sp.status }} filters={[{ name: "status", value: sp.status, options: ST.map((x) => [x, label(x)]) }]} />
    <DataTable rows={rows.slice(0, pg.limit)} href={(r) => `/commercial/quotes/${r.id}`} columns={[
      { key: "n", header: "Quote", cell: (r) => `${r.number} rev ${r.revision}` }, { key: "a", header: "Account", cell: (r) => r.account }, { key: "o", header: "Opportunity", cell: (r) => r.opportunity },
      { key: "s", header: "Status", cell: (r) => <Badge tone={r.status === "accepted" ? "ok" : r.status === "rejected" ? "bad" : r.status === "draft" ? "neutral" : "info"}>{label(r.status)}</Badge> },
      { key: "v", header: "Valid until", cell: (r) => date(r.valid_until) }, { key: "t", header: "TCV", align: "end", cell: (r) => money(r.tcv, cur) },
      ...(margin ? [{ key: "c", header: "Cost", align: "end" as const, cell: (r: Record<string, string>) => money(r.total_cost, cur) }] : [])]} />
  </>);
}
