import { notFound } from "next/navigation";
import Link from "next/link";
import { asUser } from "@/lib/server/session";
import { many, one } from "@/lib/server/db";
import { Badge, Card, Kpi, PageHeader } from "@/components/ui/primitives";
import { DataTable } from "@/components/ui/data-table";
import { money, date, label } from "@/lib/format";
import { sum } from "@/lib/finance";

export const metadata = { title: "Account 360" };
export default async function Account360({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const d = await asUser(async (db, s) => {
    const t = s.org.id;
    const a = await one<Record<string, string | null>>(db, "select a.*, p.full_name as owner from public.accounts a left join public.profiles p on p.user_id = a.owner_id where a.tenant_id = $1 and a.id = $2", [t, id]);
    if (!a) return null;
    const [contacts, opps, ags, acts, fin] = await Promise.all([
      many<Record<string, string>>(db, "select id, full_name, title, email, phone, is_primary from public.contacts where tenant_id = $1 and account_id = $2 order by is_primary desc, full_name", [t, id]),
      many<Record<string, string>>(db, "select id, number, name, stage, tcv, expected_close, probability from public.opportunities where tenant_id = $1 and account_id = $2 order by expected_close desc", [t, id]),
      many<Record<string, string>>(db, "select id, number, type, title, status, contract_value, end_date from public.agreements where tenant_id = $1 and account_id = $2 order by end_date desc nulls last", [t, id]),
      many<Record<string, string>>(db, "select kind, subject, due_at, completed_at from public.activities where tenant_id = $1 and account_id = $2 order by due_at desc limit 10", [t, id]),
      s.can("finance.view") ? one<Record<string, string>>(db, "select coalesce(sum(revenue),0) as rev, coalesce(sum(cost),0) as cost from public.financial_actuals where tenant_id = $1 and account_id = $2 and period_month >= date_trunc('year', now())", [t, id]) : null,
    ]);
    return { a, contacts, opps, ags, acts, fin, cur: s.org.base_currency };
  }, "account.view");
  if (!d) notFound();
  const { a, cur } = d;
  const open = d.opps.filter((o) => !o.stage.startsWith("closed"));
  return (<>
    <PageHeader title={String(a.name)} subtitle={<>{a.number} · {a.industry ?? "No industry"} · {a.country ?? "—"} · Owner {a.owner ?? "—"}</>} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Kpi label="Open opportunities" value={String(open.length)} href={`/commercial/opportunities?account=${id}`} sub={money(sum(open.map((o) => o.tcv)).toFixed(2), cur)} />
      <Kpi label="Active agreements" value={String(d.ags.filter((g) => g.status === "active").length)} href={`/commercial/agreements?account=${id}`} />
      {d.fin && <Kpi label="Revenue YTD" value={money(d.fin.rev, cur, true)} href={`/commercial/performance?account=${id}`} sub={`Cost ${money(d.fin.cost, cur, true)}`} />}
      <Kpi label="Health score" value={a.health_score ?? "—"} href={`/commercial/accounts/${id}`} />
    </div>
    <div className="mt-4 grid gap-4 xl:grid-cols-2">
      <Card title="Opportunities"><DataTable rows={d.opps} href={(o) => `/commercial/opportunities/${o.id}`} columns={[{ key: "n", header: "Opportunity", cell: (o) => o.name }, { key: "s", header: "Stage", cell: (o) => <Badge tone={o.stage === "closed_won" ? "ok" : o.stage === "closed_lost" ? "bad" : "info"}>{label(o.stage)}</Badge> }, { key: "v", header: "TCV", align: "end", cell: (o) => money(o.tcv, cur) }]} /></Card>
      <Card title="Agreements"><DataTable rows={d.ags} href={(g) => `/commercial/agreements/${g.id}`} columns={[{ key: "t", header: "Agreement", cell: (g) => g.title }, { key: "ty", header: "Type", cell: (g) => g.type.toUpperCase() }, { key: "e", header: "Ends", cell: (g) => date(g.end_date) }, { key: "v", header: "Value", align: "end", cell: (g) => money(g.contract_value, cur) }]} /></Card>
      <Card title="Contacts"><DataTable rows={d.contacts} columns={[{ key: "n", header: "Name", cell: (c) => <>{c.full_name}{c.is_primary ? <> <Badge tone="brand">Primary</Badge></> : null}</> }, { key: "t", header: "Title", cell: (c) => c.title }, { key: "e", header: "E-mail", cell: (c) => <a className="text-link" href={`mailto:${c.email}`}>{c.email}</a> }]} /></Card>
      <Card title="Recent activity" action={<Link href={`/commercial/activities?account=${id}`} className="text-xs text-link">All</Link>}><DataTable rows={d.acts} columns={[{ key: "k", header: "Type", cell: (x) => label(x.kind) }, { key: "s", header: "Subject", cell: (x) => x.subject }, { key: "d", header: "Due", cell: (x) => date(x.due_at) }]} /></Card>
    </div>
  </>);
}
