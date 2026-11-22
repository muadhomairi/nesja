import { asUser } from "@/lib/server/session";
import { many, one } from "@/lib/server/db";
import { Badge, Card, Field, Input, PageHeader, Select } from "@/components/ui/primitives";
import { DataTable } from "@/components/ui/data-table";
import { ActionForm } from "@/components/forms/action-form";
import { inviteAction } from "@/app/actions/org";
import { date, label } from "@/lib/format";
export const metadata = { title: "Administration" };
export default async function Admin() {
  const d = await asUser(async (db, s) => ({
    org: s.org, canAudit: s.can("admin.audit"),
    sub: await one<Record<string, string>>(db, "select plan_code, status, seats, trial_ends_at from public.subscriptions where tenant_id = $1", [s.org.id]),
    ent: await many<{ product_code: string; enabled: boolean }>(db, "select product_code, enabled from public.entitlements where tenant_id = $1 order by product_code", [s.org.id]),
    members: await many<Record<string, string>>(db, `select p.full_name, p.email, r.name as role, m.status, m.joined_at, b.name as unit from public.memberships m join public.profiles p on p.user_id = m.user_id
      join public.roles r on r.tenant_id = m.tenant_id and r.id = m.role_id left join public.business_units b on b.tenant_id = m.tenant_id and b.id = m.business_unit_id where m.tenant_id = $1 order by p.full_name`, [s.org.id]),
    invites: await many<Record<string, string>>(db, `select i.email, r.name as role, i.expires_at, i.accepted_at from public.invitations i join public.roles r on r.tenant_id = i.tenant_id and r.id = i.role_id where i.tenant_id = $1 order by i.created_at desc limit 50`, [s.org.id]),
    roles: await many<{ key: string; name: string; n: number }>(db, "select r.key, r.name, count(rp.permission_code)::int as n from public.roles r left join public.role_permissions rp on rp.tenant_id = r.tenant_id and rp.role_id = r.id where r.tenant_id = $1 group by r.key, r.name order by r.name", [s.org.id]),
    audit: s.can("admin.audit") ? await many<Record<string, string>>(db, "select l.occurred_at, l.action, l.entity, l.actor_kind, coalesce(p.full_name, p.email) as full_name from public.audit_log l left join public.profiles p on p.user_id = l.actor_user_id where l.tenant_id = $1 order by l.id desc limit 30", [s.org.id]) : [],
  }), "admin.users");
  return (<>
    <PageHeader title="Organization administration" subtitle={`${d.org.name} · ${d.org.slug}`} />
    <div className="grid gap-4 xl:grid-cols-3">
      <Card title="Subscription & entitlements">
        <p className="text-sm">Plan <b>{label(d.sub?.plan_code)}</b> · {label(d.sub?.status)} · {d.sub?.seats} seats{d.sub?.trial_ends_at ? ` · trial ends ${date(d.sub.trial_ends_at)}` : ""}</p>
        <ul className="mt-2 space-y-1 text-sm">{d.ent.map((e) => <li key={e.product_code}>{label(e.product_code)}: <Badge tone={e.enabled ? "ok" : "neutral"}>{e.enabled ? "Enabled" : "Not enabled"}</Badge></li>)}</ul>
        <p className="mt-2 text-xs text-muted">Billing is not connected: NESJA's paid plans and prices are not yet published.</p>
      </Card>
      <Card title="Invite a user" className="xl:col-span-2">
        <ActionForm action={inviteAction} submit="Send invitation"><div className="grid gap-3 sm:grid-cols-2">
          <Field label="E-mail" htmlFor="email"><Input id="email" name="email" type="email" required /></Field>
          <Field label="Role" htmlFor="role"><Select id="role" name="role">{d.roles.filter((r) => r.key !== "owner").map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}</Select></Field></div></ActionForm>
      </Card>
    </div>
    <div className="mt-4 grid gap-4 xl:grid-cols-2">
      <Card title={`Users (${d.members.length})`}><DataTable rows={d.members} columns={[{ key: "n", header: "Name", cell: (m) => m.full_name ?? m.email }, { key: "e", header: "E-mail", cell: (m) => m.email }, { key: "r", header: "Role", cell: (m) => m.role }, { key: "u", header: "Unit", cell: (m) => m.unit ?? "—" }, { key: "s", header: "Status", cell: (m) => label(m.status) }]} /></Card>
      <Card title="Roles & permissions"><DataTable rows={d.roles} columns={[{ key: "n", header: "Role", cell: (r) => r.name }, { key: "p", header: "Permissions", align: "end", cell: (r) => r.n }]} /><p className="mt-2 text-xs text-muted">Roles are per organization: add or change them without code changes.</p></Card>
      <Card title="Invitations"><DataTable rows={d.invites} empty="No invitations" columns={[{ key: "e", header: "E-mail", cell: (i) => i.email }, { key: "r", header: "Role", cell: (i) => i.role }, { key: "s", header: "Status", cell: (i) => (i.accepted_at ? <Badge tone="ok">Accepted</Badge> : new Date(i.expires_at) < new Date() ? <Badge>Expired</Badge> : <Badge tone="info">Pending</Badge>) }]} /></Card>
      {d.canAudit && <Card title="Audit trail (latest 30)"><DataTable rows={d.audit} columns={[{ key: "t", header: "When", cell: (a) => new Date(a.occurred_at).toISOString().replace("T", " ").slice(0, 16) }, { key: "w", header: "Who", cell: (a) => a.full_name ?? label(a.actor_kind) }, { key: "a", header: "Action", cell: (a) => `${a.action} ${a.entity}` }]} /></Card>}
    </div>
  </>);
}
