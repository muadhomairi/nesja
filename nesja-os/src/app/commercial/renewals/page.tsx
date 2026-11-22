import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { paging, type ListParams } from "@/lib/server/list";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge, PageHeader } from "@/components/ui/primitives";
import { money, date, label, pct } from "@/lib/format";
import { D } from "@/lib/finance";
export const metadata = { title: "Renewals" };
export default async function Renewals({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams; const pg = paging(sp);
  const win = ["90", "180", "365"].includes(sp.window ?? "") ? Number(sp.window) : null;
  const { rows, cur } = await asUser(async (db, s) => ({ cur: s.org.base_currency, rows: await many<Record<string, string>>(db, `
    select r.id, r.due_date, r.current_value, r.proposed_value, r.risk, r.status, g.id as agreement_id, g.title, g.end_date, a.name as account
    from public.renewals r join public.agreements g on g.tenant_id = r.tenant_id and g.id = r.agreement_id join public.accounts a on a.tenant_id = g.tenant_id and a.id = g.account_id
    where r.tenant_id = $1 and ($2::int is null or (r.status in ('upcoming','in_progress') and r.due_date < current_date + $2)) and ($3::text is null or r.risk = $3)
    order by r.due_date limit $4 offset $5`, [s.org.id, win, sp.risk || null, pg.limit + 1, pg.offset]) }), "renewal.view");
  return (<>
    <PageHeader title="Renewals" subtitle="Contract expiry, renewal risk and repricing." />
    <ListToolbar page={pg.page} hasMore={rows.length > pg.limit} base={{ window: sp.window, risk: sp.risk }} filters={[{ name: "window", value: sp.window, options: [["90", "Due in 90 days"], ["180", "Due in 180 days"], ["365", "Due in 12 months"]] }, { name: "risk", value: sp.risk, options: [["high", "High risk"], ["medium", "Medium"], ["low", "Low"]] }]} />
    <DataTable rows={rows.slice(0, pg.limit)} href={(r) => `/commercial/agreements/${r.agreement_id}`} columns={[
      { key: "t", header: "Agreement", cell: (r) => r.title }, { key: "a", header: "Account", cell: (r) => r.account }, { key: "d", header: "Decision due", cell: (r) => date(r.due_date) }, { key: "e", header: "Expires", cell: (r) => date(r.end_date) },
      { key: "r", header: "Risk", cell: (r) => <Badge tone={r.risk === "high" ? "bad" : r.risk === "medium" ? "warn" : "ok"}>{label(r.risk)}</Badge> }, { key: "s", header: "Status", cell: (r) => label(r.status) },
      { key: "c", header: "Annual value", align: "end", cell: (r) => money(r.current_value, cur) }, { key: "p", header: "Proposed", align: "end", cell: (r) => money(r.proposed_value, cur) },
      { key: "u", header: "Uplift", align: "end", cell: (r) => (r.proposed_value ? pct(new D(r.proposed_value).dividedBy(r.current_value).minus(1).toString()) : "—") }]} />
  </>);
}
