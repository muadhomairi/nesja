import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { like, paging, type ListParams } from "@/lib/server/list";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge, PageHeader } from "@/components/ui/primitives";
import { money, date, label } from "@/lib/format";
const TY = ["nda", "mou", "msa", "sow", "order_form", "amendment"]; const ST = ["draft", "in_review", "awaiting_signature", "active", "expired", "terminated"];
export const metadata = { title: "Agreements" };
export default async function Agreements({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams; const pg = paging(sp);
  const { rows, cur } = await asUser(async (db, s) => ({ cur: s.org.base_currency, rows: await many<Record<string, string>>(db, `
    select g.id, g.number, g.type, g.title, g.status, g.contract_value, g.start_date, g.end_date, g.auto_renew, a.name as account
    from public.agreements g join public.accounts a on a.tenant_id = g.tenant_id and a.id = g.account_id
    where g.tenant_id = $1 and ($2::text is null or g.title ilike $2 or g.number ilike $2 or a.name ilike $2) and ($3::public.agreement_type is null or g.type = $3)
      and ($4::public.agreement_status is null or g.status = $4) and ($5::uuid is null or g.account_id = $5)
    order by g.end_date nulls last limit $6 offset $7`, [s.org.id, like(sp.q), TY.includes(sp.type ?? "") ? sp.type : null, ST.includes(sp.status ?? "") ? sp.status : null, /^[0-9a-f-]{36}$/.test(sp.account ?? "") ? sp.account : null, pg.limit + 1, pg.offset]) }), "agreement.view");
  return (<>
    <PageHeader title="Agreements" subtitle="NDA, MOU, MSA, SOW and order forms with schedules, values and expiry." />
    <ListToolbar q={sp.q} page={pg.page} hasMore={rows.length > pg.limit} base={{ q: sp.q, type: sp.type, status: sp.status, account: sp.account }} filters={[{ name: "type", value: sp.type, options: TY.map((x) => [x, x.toUpperCase().replace("_", " ")]) }, { name: "status", value: sp.status, options: ST.map((x) => [x, label(x)]) }]} />
    <DataTable rows={rows.slice(0, pg.limit)} href={(r) => `/commercial/agreements/${r.id}`} columns={[
      { key: "t", header: "Agreement", cell: (r) => r.title }, { key: "ty", header: "Type", cell: (r) => r.type.toUpperCase().replace("_", " ") }, { key: "a", header: "Account", cell: (r) => r.account },
      { key: "s", header: "Status", cell: (r) => <Badge tone={r.status === "active" ? "ok" : r.status === "expired" ? "neutral" : "info"}>{label(r.status)}</Badge> },
      { key: "sd", header: "Start", cell: (r) => date(r.start_date) }, { key: "e", header: "End", cell: (r) => date(r.end_date) }, { key: "v", header: "Value", align: "end", cell: (r) => money(r.contract_value, cur) }]} />
  </>);
}
