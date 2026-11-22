import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { paging, type ListParams } from "@/lib/server/list";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge, PageHeader } from "@/components/ui/primitives";
import { date, label, pct } from "@/lib/format";
import { Decide } from "./decide";
export const metadata = { title: "Approvals" };
export default async function Approvals({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams; const pg = paging(sp);
  const { rows, me, canDecide } = await asUser(async (db, s) => ({ me: s.userId, canDecide: s.can("approval.edit"), rows: await many<Record<string, string>>(db, `
    select r.id, r.kind, r.entity, r.entity_id, r.reason, r.measured_value, r.threshold_value, r.status, r.created_at, r.decided_at, r.requested_by, rq.full_name as requester, ap.full_name as approver
    from public.approval_requests r left join public.profiles rq on rq.user_id = r.requested_by left join public.profiles ap on ap.user_id = r.approver_id
    where r.tenant_id = $1 and ($2::public.approval_status is null or r.status = $2) order by r.status = 'pending' desc, r.created_at desc limit $3 offset $4`,
    [s.org.id, ["pending", "approved", "rejected"].includes(sp.status ?? "") ? sp.status : null, pg.limit + 1, pg.offset]) }), "approval.view");
  return (<>
    <PageHeader title="Approvals" subtitle="Pricing, margin, contract and bid approvals. You cannot decide a request you raised." />
    <ListToolbar page={pg.page} hasMore={rows.length > pg.limit} base={{ status: sp.status }} filters={[{ name: "status", value: sp.status, options: [["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"]] }]} />
    <DataTable rows={rows.slice(0, pg.limit)} href={(r) => (r.entity === "quote" ? `/commercial/quotes/${r.entity_id}` : "#")} columns={[
      { key: "r", header: "Request", cell: (r) => r.reason }, { key: "k", header: "Type", cell: (r) => label(r.kind) },
      { key: "m", header: "Measured / threshold", cell: (r) => (r.kind === "margin" ? `${pct(r.measured_value)} / ${pct(r.threshold_value)}` : "—") },
      { key: "by", header: "Requested by", cell: (r) => r.requester ?? "—" }, { key: "d", header: "Raised", cell: (r) => date(r.created_at) },
      { key: "s", header: "Status", cell: (r) => <Badge tone={r.status === "approved" ? "ok" : r.status === "rejected" ? "bad" : "warn"}>{label(r.status)}</Badge> },
      { key: "a", header: "Decision", cell: (r) => (r.status === "pending" && canDecide && r.requested_by !== me ? <Decide id={r.id} /> : r.approver ? `${r.approver} · ${date(r.decided_at)}` : "—") }]} />
  </>);
}
