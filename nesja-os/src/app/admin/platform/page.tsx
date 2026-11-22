import { redirect } from "next/navigation";
import { requireSession } from "@/lib/server/session";
import { many, withUser } from "@/lib/server/db";
import { Badge, PageHeader } from "@/components/ui/primitives";
import { DataTable } from "@/components/ui/data-table";
import { date, label } from "@/lib/format";
import { TenantStatus } from "./tenant-status";
export const metadata = { title: "Platform administration" };
/** NESJA staff only (profiles.is_platform_admin). Separate from tenant administration. */
export default async function Platform() {
  const s = await requireSession();
  if (!s.isPlatformAdmin) redirect("/forbidden");
  const rows = await withUser(s.userId, (db) => many<Record<string, string>>(db, `select t.id, t.name, t.slug, t.kind, t.status, t.created_at, sub.plan_code, sub.seats,
    (select count(*) from public.memberships m where m.tenant_id = t.id and m.status = 'active')::int as users from public.tenants t left join public.subscriptions sub on sub.tenant_id = t.id order by t.created_at desc`));
  return (<>
    <PageHeader title="Platform administration" subtitle="All NESJA organizations. Tenant data is not shown here; only lifecycle and entitlements." />
    <DataTable rows={rows} columns={[{ key: "n", header: "Organization", cell: (r) => r.name }, { key: "s", header: "Slug", cell: (r) => r.slug }, { key: "k", header: "Kind", cell: (r) => <Badge tone={r.kind === "demo" ? "brand" : "neutral"}>{label(r.kind)}</Badge> },
      { key: "p", header: "Plan", cell: (r) => `${label(r.plan_code)} · ${r.seats ?? "—"} seats` }, { key: "u", header: "Users", align: "end", cell: (r) => r.users }, { key: "c", header: "Created", cell: (r) => date(r.created_at) },
      { key: "st", header: "Status", cell: (r) => <TenantStatus id={r.id} status={r.status} /> }]} />
  </>);
}
