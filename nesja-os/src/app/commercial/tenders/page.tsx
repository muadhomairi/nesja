import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { like, paging, type ListParams } from "@/lib/server/list";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge, Kpi, PageHeader } from "@/components/ui/primitives";
import { money, date, label } from "@/lib/format";
const ST = ["identified", "qualifying", "preparing", "submitted", "awarded", "lost", "withdrawn"];
export const metadata = { title: "Tenders & bids" };
export default async function Tenders({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams; const pg = paging(sp);
  const { rows, cur, k } = await asUser(async (db, s) => ({ cur: s.org.base_currency,
    k: (await many<{ status: string; n: number; v: string }>(db, "select status::text, count(*)::int as n, coalesce(sum(bid_value),0) as v from public.tenders where tenant_id = $1 group by status", [s.org.id])),
    rows: await many<Record<string, string>>(db, `select t.id, t.reference, t.title, t.status, t.submission_due, t.bid_value, t.go_no_go, t.opportunity_id, a.name as account, coalesce(p.full_name, p.email) as owner
      from public.tenders t join public.accounts a on a.tenant_id = t.tenant_id and a.id = t.account_id left join public.profiles p on p.user_id = t.owner_id
      where t.tenant_id = $1 and ($2::text is null or t.title ilike $2 or t.reference ilike $2 or a.name ilike $2) and ($3::public.tender_status is null or t.status = $3)
      order by t.submission_due desc nulls last limit $4 offset $5`, [s.org.id, like(sp.q), ST.includes(sp.status ?? "") ? sp.status : null, pg.limit + 1, pg.offset]) }), "tender.view");
  const n = (st: string) => k.find((x) => x.status === st)?.n ?? 0;
  const decided = n("awarded") + n("lost");
  return (<>
    <PageHeader title="Tenders & bids" subtitle="Go/no-go, bid preparation, submission and award." />
    <div className="mb-4 grid gap-3 sm:grid-cols-4">
      <Kpi label="In preparation" value={String(n("identified") + n("qualifying") + n("preparing"))} href="?status=preparing" />
      <Kpi label="Submitted, awaiting award" value={String(n("submitted"))} href="?status=submitted" />
      <Kpi label="Awarded" value={String(n("awarded"))} href="?status=awarded" />
      <Kpi label="Bid win rate" value={decided ? `${Math.round((n("awarded") / decided) * 100)}%` : "—"} href="?status=lost" sub={`${decided} decided`} />
    </div>
    <ListToolbar q={sp.q} page={pg.page} hasMore={rows.length > pg.limit} base={{ q: sp.q, status: sp.status }} filters={[{ name: "status", value: sp.status, options: ST.map((x) => [x, label(x)]) }]} />
    <DataTable rows={rows.slice(0, pg.limit)} href={(r) => (r.opportunity_id ? `/commercial/opportunities/${r.opportunity_id}` : "#")} columns={[
      { key: "t", header: "Tender", cell: (r) => r.title }, { key: "r", header: "Reference", cell: (r) => r.reference }, { key: "a", header: "Account", cell: (r) => r.account },
      { key: "s", header: "Status", cell: (r) => <Badge tone={r.status === "awarded" ? "ok" : r.status === "lost" ? "bad" : "info"}>{label(r.status)}</Badge> },
      { key: "g", header: "Go / no-go", cell: (r) => label(r.go_no_go) }, { key: "d", header: "Due", cell: (r) => date(r.submission_due) }, { key: "o", header: "Bid manager", cell: (r) => r.owner ?? "—" },
      { key: "v", header: "Bid value", align: "end", cell: (r) => money(r.bid_value, cur) }]} />
  </>);
}
