import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { like, paging, type ListParams } from "@/lib/server/list";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge, PageHeader } from "@/components/ui/primitives";
import { money, label } from "@/lib/format";

type Row = { id: string; number: string; name: string; industry: string | null; country: string | null; segment: string | null; health_score: number | null; owner: string | null; open_pipeline: string; contract_value: string };
export const metadata = { title: "Accounts" };
export default async function Accounts({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams; const pg = paging(sp);
  const { rows, cur } = await asUser(async (db, s) => ({ cur: s.org.base_currency, rows: await many<Row>(db, `
    select a.id, a.number, a.name, a.industry, a.country, a.segment, a.health_score, p.full_name as owner,
      coalesce((select sum(o.tcv) from public.opportunities o where o.tenant_id = a.tenant_id and o.account_id = a.id and o.stage not in ('closed_won','closed_lost')), 0) as open_pipeline,
      coalesce((select sum(g.contract_value) from public.agreements g where g.tenant_id = a.tenant_id and g.account_id = a.id and g.status = 'active'), 0) as contract_value
    from public.accounts a left join public.profiles p on p.user_id = a.owner_id
    where a.tenant_id = $1 and a.archived_at is null and ($2::text is null or a.name ilike $2 or a.number ilike $2) and ($3::text is null or a.segment = $3)
    order by a.name limit $4 offset $5`, [s.org.id, like(sp.q), sp.segment || null, pg.limit + 1, pg.offset]) }), "account.view");
  return (<>
    <PageHeader title="Accounts" subtitle="Customers and prospects with their open pipeline and active contract value." />
    <ListToolbar q={sp.q} page={pg.page} hasMore={rows.length > pg.limit} base={{ q: sp.q, segment: sp.segment }} filters={[{ name: "segment", value: sp.segment, options: [["enterprise", "Enterprise"], ["mid_market", "Mid-market"], ["smb", "SMB"], ["public_sector", "Public sector"]] }]} />
    <DataTable rows={rows.slice(0, pg.limit)} href={(r) => `/commercial/accounts/${r.id}`} empty="No accounts match" columns={[
      { key: "name", header: "Account", cell: (r) => r.name }, { key: "number", header: "No.", cell: (r) => r.number },
      { key: "industry", header: "Industry", cell: (r) => r.industry ?? "—" }, { key: "segment", header: "Segment", cell: (r) => label(r.segment) },
      { key: "health", header: "Health", cell: (r) => r.health_score === null ? "—" : <Badge tone={r.health_score >= 70 ? "ok" : r.health_score >= 50 ? "warn" : "bad"}>{r.health_score}</Badge> },
      { key: "owner", header: "Owner", cell: (r) => r.owner ?? "—" },
      { key: "pipe", header: "Open pipeline", align: "end", cell: (r) => money(r.open_pipeline, cur) },
      { key: "cv", header: "Active contracts", align: "end", cell: (r) => money(r.contract_value, cur) }]} />
  </>);
}
