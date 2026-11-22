import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { like, paging, type ListParams } from "@/lib/server/list";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge, ButtonLink, PageHeader } from "@/components/ui/primitives";
import { money, date, label } from "@/lib/format";
import { sum } from "@/lib/finance";

const STAGES = ["prospecting", "qualification", "solution", "proposal", "negotiation", "closed_won", "closed_lost"];
type Row = { id: string; number: string; name: string; account: string; stage: string; revenue_type: string; tcv: string; weighted_value: string; gross_margin: string; expected_close: string; owner: string | null; probability: number };
export const metadata = { title: "Opportunities" };
export default async function Opportunities({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams; const pg = paging(sp);
  const stage = STAGES.includes(sp.stage ?? "") ? sp.stage! : null;
  const { rows, cur, margin, canCreate } = await asUser(async (db, s) => ({ cur: s.org.base_currency, margin: s.can("opportunity.view_margin"), canCreate: s.can("opportunity.create"), rows: await many<Row>(db, `
    select o.id, o.number, o.name, a.name as account, o.stage, o.revenue_type, o.tcv, o.weighted_value, o.gross_margin, o.expected_close, o.probability, p.full_name as owner
    from public.opportunities o join public.accounts a on a.tenant_id = o.tenant_id and a.id = o.account_id left join public.profiles p on p.user_id = o.owner_id
    where o.tenant_id = $1 and ($2::text is null or o.name ilike $2 or o.number ilike $2 or a.name ilike $2)
      and ($3::public.opp_stage is null or o.stage = $3) and ($4::text is null or ($4 = 'open' and o.stage not in ('closed_won','closed_lost')))
      and ($5::uuid is null or o.account_id = $5) and ($6::text is null or ($6 = 'ytd' and o.closed_at >= date_trunc('year', now())))
    order by o.expected_close limit $7 offset $8`, [s.org.id, like(sp.q), stage, sp.status || null, /^[0-9a-f-]{36}$/.test(sp.account ?? "") ? sp.account : null, sp.period || null, pg.limit + 1, pg.offset]) }), "opportunity.view");
  const shown = rows.slice(0, pg.limit);
  return (<>
    <PageHeader title="Opportunities" subtitle="Pipeline with TCV, weighted value and margin computed by the database." actions={canCreate && <ButtonLink href="/commercial/opportunities/new">New opportunity</ButtonLink>} />
    <ListToolbar q={sp.q} page={pg.page} hasMore={rows.length > pg.limit} base={{ q: sp.q, stage: sp.stage, status: sp.status, account: sp.account, period: sp.period }} filters={[{ name: "stage", value: sp.stage, options: STAGES.map((x) => [x, label(x)]) }]} />
    <DataTable rows={shown} href={(r) => `/commercial/opportunities/${r.id}`} empty="No opportunities match" columns={[
      { key: "n", header: "Opportunity", cell: (r) => r.name }, { key: "a", header: "Account", cell: (r) => r.account },
      { key: "s", header: "Stage", cell: (r) => <Badge tone={r.stage === "closed_won" ? "ok" : r.stage === "closed_lost" ? "bad" : "info"}>{label(r.stage)}</Badge> },
      { key: "c", header: "Close", cell: (r) => date(r.expected_close) }, { key: "o", header: "Owner", cell: (r) => r.owner ?? "—" },
      { key: "t", header: "TCV", align: "end", cell: (r) => money(r.tcv, cur) }, { key: "w", header: "Weighted", align: "end", cell: (r) => money(r.weighted_value, cur) },
      ...(margin ? [{ key: "g", header: "Gross margin", align: "end" as const, cell: (r: Row) => money(r.gross_margin, cur) }] : [])]}
      footer={<tr><td className="px-3 py-2" colSpan={5}>Total ({shown.length})</td><td className="px-3 py-2 text-end tabular">{money(sum(shown.map((r) => r.tcv)).toFixed(2), cur)}</td><td className="px-3 py-2 text-end tabular">{money(sum(shown.map((r) => r.weighted_value)).toFixed(2), cur)}</td>{margin && <td className="px-3 py-2 text-end tabular">{money(sum(shown.map((r) => r.gross_margin)).toFixed(2), cur)}</td>}</tr>} />
  </>);
}
