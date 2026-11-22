import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { like, paging, type ListParams } from "@/lib/server/list";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge, PageHeader } from "@/components/ui/primitives";
import { money, date, label } from "@/lib/format";
const ST = ["new", "working", "qualified", "disqualified", "converted"];
export const metadata = { title: "Leads" };
export default async function Leads({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams; const pg = paging(sp);
  const { rows, cur } = await asUser(async (db, s) => ({ cur: s.org.base_currency, rows: await many<Record<string, string>>(db, `
    select l.id, l.number, l.company_name, l.contact_name, l.source, l.status, l.estimated_value, l.created_at, l.converted_opportunity_id, coalesce(p.full_name, p.email) as owner
    from public.leads l left join public.profiles p on p.user_id = l.owner_id
    where l.tenant_id = $1 and ($2::text is null or l.company_name ilike $2 or l.number ilike $2 or l.contact_name ilike $2) and ($3::public.lead_status is null or l.status = $3)
    order by l.created_at desc limit $4 offset $5`, [s.org.id, like(sp.q), ST.includes(sp.status ?? "") ? sp.status : null, pg.limit + 1, pg.offset]) }), "lead.view");
  return (<>
    <PageHeader title="Leads" subtitle="Inbound and outbound leads, qualification and conversion to opportunities." />
    <ListToolbar q={sp.q} page={pg.page} hasMore={rows.length > pg.limit} base={{ q: sp.q, status: sp.status }} filters={[{ name: "status", value: sp.status, options: ST.map((x) => [x, label(x)]) }]} />
    <DataTable rows={rows.slice(0, pg.limit)} href={(r) => (r.converted_opportunity_id ? `/commercial/opportunities/${r.converted_opportunity_id}` : `/commercial/leads?q=${encodeURIComponent(r.number)}`)} columns={[
      { key: "c", header: "Company", cell: (r) => r.company_name }, { key: "n", header: "No.", cell: (r) => r.number }, { key: "p", header: "Contact", cell: (r) => r.contact_name },
      { key: "s", header: "Status", cell: (r) => <Badge tone={r.status === "converted" ? "ok" : r.status === "disqualified" ? "bad" : r.status === "qualified" ? "brand" : "neutral"}>{label(r.status)}</Badge> },
      { key: "src", header: "Source", cell: (r) => r.source }, { key: "o", header: "Owner", cell: (r) => r.owner ?? "—" }, { key: "d", header: "Created", cell: (r) => date(r.created_at) },
      { key: "v", header: "Est. value", align: "end", cell: (r) => money(r.estimated_value, cur) }]} />
  </>);
}
