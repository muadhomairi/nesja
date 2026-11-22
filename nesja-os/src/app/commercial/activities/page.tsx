import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { like, paging, type ListParams } from "@/lib/server/list";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge, PageHeader } from "@/components/ui/primitives";
import { date, label } from "@/lib/format";
export const metadata = { title: "Activities" };
export default async function Activities({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams; const pg = paging(sp);
  const rows = await asUser((db, s) => many<Record<string, string>>(db, `
    select x.id, x.kind, x.subject, x.due_at, x.completed_at, x.opportunity_id, x.account_id, p.full_name as owner from public.activities x left join public.profiles p on p.user_id = x.owner_id
    where x.tenant_id = $1 and ($2::text is null or x.subject ilike $2) and ($3::uuid is null or x.account_id = $3) and ($4::text is null or ($4 = 'open' and x.completed_at is null) or ($4 = 'overdue' and x.completed_at is null and x.due_at < now()))
    order by x.due_at desc limit $5 offset $6`, [s.org.id, like(sp.q), /^[0-9a-f-]{36}$/.test(sp.account ?? "") ? sp.account : null, sp.status || null, pg.limit + 1, pg.offset]), "activity.view");
  return (<>
    <PageHeader title="Activities" subtitle="Calls, meetings, e-mails, tasks and site visits." />
    <ListToolbar q={sp.q} page={pg.page} hasMore={rows.length > pg.limit} base={{ q: sp.q, account: sp.account, status: sp.status }} filters={[{ name: "status", value: sp.status, options: [["open", "Open"], ["overdue", "Overdue"]] }]} />
    <DataTable rows={rows.slice(0, pg.limit)} href={(r) => (r.opportunity_id ? `/commercial/opportunities/${r.opportunity_id}` : `/commercial/accounts/${r.account_id}`)} columns={[
      { key: "s", header: "Subject", cell: (r) => r.subject }, { key: "k", header: "Type", cell: (r) => label(r.kind) }, { key: "d", header: "Due", cell: (r) => date(r.due_at) },
      { key: "st", header: "Status", cell: (r) => (r.completed_at ? <Badge tone="ok">Done</Badge> : new Date(r.due_at) < new Date() ? <Badge tone="bad">Overdue</Badge> : <Badge tone="info">Open</Badge>) },
      { key: "o", header: "Owner", cell: (r) => r.owner ?? "—" }]} />
  </>);
}
