import Link from "next/link";
import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { paging, type ListParams } from "@/lib/server/list";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Badge, ButtonLink, Card, Kpi, PageHeader } from "@/components/ui/primitives";
import { date, label, money } from "@/lib/format";
import { D } from "@/lib/finance";

type Issue = { module: string; severity: string; rule: string; message: string; entity_label: string; link: string; since: string | null };
type Check = { check_key: string; label: string; entity_label: string; link: string; source_value: string | null; comparison_value: string | null; status: string };
const SEV = ["critical", "high", "medium", "low"] as const;
const TONE = { critical: "bad", high: "bad", medium: "warn", low: "neutral" } as const;

export const metadata = { title: "Data quality & revenue assurance" };
export default async function DataQuality({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams; const pg = paging(sp);
  const sev = SEV.includes(sp.severity as (typeof SEV)[number]) ? sp.severity! : null;
  const mod = ["opportunity", "account", "contract", "quotation"].includes(sp.module ?? "") ? sp.module! : null;
  const recon = ["reconciled", "discrepancy", "incomplete"].includes(sp.recon ?? "") ? sp.recon! : "discrepancy";
  const d = await asUser(async (db, s) => ({
    cur: s.org.base_currency, canExport: s.can("data.export"),
    counts: await many<{ severity: string; n: number }>(db, "select severity, count(*)::int as n from public.data_quality_issues where tenant_id = $1 group by 1", [s.org.id]),
    issues: await many<Issue>(db, `select module, severity, rule, message, entity_label, link, since from public.data_quality_issues
      where tenant_id = $1 and ($2::text is null or severity = $2) and ($3::text is null or module = $3)
      order by array_position(array['critical','high','medium','low'], severity), since nulls last limit $4 offset $5`, [s.org.id, sev, mod, pg.limit + 1, pg.offset]),
    reconCounts: await many<{ status: string; n: number }>(db, "select status, count(*)::int as n from public.reconciliation_checks where tenant_id = $1 group by 1", [s.org.id]),
    checks: await many<Check>(db, `select check_key, label, entity_label, link, source_value, comparison_value, status from public.reconciliation_checks
      where tenant_id = $1 and status = $2 order by check_key, entity_label limit 100`, [s.org.id, recon]),
  }), "report.view");
  const n = (sevKey: string) => d.counts.find((c) => c.severity === sevKey)?.n ?? 0;
  const rc = (st: string) => d.reconCounts.find((c) => c.status === st)?.n ?? 0;
  const total = d.reconCounts.reduce((a, c) => a + c.n, 0);
  return (<>
    <PageHeader title="Data quality & revenue assurance" subtitle="Rules run live on your records. Every issue links to the record that needs fixing."
      actions={d.canExport ? <ButtonLink variant="secondary" href="/api/export/data-quality">Export CSV</ButtonLink> : undefined} />
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {SEV.map((k) => <Kpi key={k} label={`${label(k)} issues`} value={String(n(k))} href={`?severity=${k}`} status={n(k) === 0 ? "on_target" : k === "critical" || k === "high" ? "off_target" : "at_risk"} />)}
      <Kpi label="Reconciled checks" value={total ? `${rc("reconciled")} / ${total}` : "—"} href="?recon=reconciled#reconciliation" status={rc("discrepancy") ? "off_target" : total ? "on_target" : "none"} sub={`${rc("discrepancy")} discrepancies · ${rc("incomplete")} incomplete`} />
    </div>
    <h2 className="mt-6 mb-2 font-semibold">Issues</h2>
    <ListToolbar page={pg.page} hasMore={d.issues.length > pg.limit} search={false} base={{ severity: sp.severity, module: sp.module }} filters={[
      { name: "severity", value: sp.severity, all: "All severities", options: SEV.map((k) => [k, label(k)] as [string, string]) },
      { name: "module", value: sp.module, all: "All areas", options: [["opportunity", "Opportunities"], ["account", "Accounts"], ["contract", "Agreements"], ["quotation", "Quotations"]] }]} />
    <DataTable rows={d.issues.slice(0, pg.limit)} href={(r) => r.link} empty="No issues match. Your data passes these rules." columns={[
      { key: "e", header: "Record", cell: (r) => r.entity_label }, { key: "m", header: "Area", cell: (r) => label(r.module) },
      { key: "s", header: "Severity", cell: (r) => <Badge tone={TONE[r.severity as keyof typeof TONE] ?? "neutral"}>{label(r.severity)}</Badge> },
      { key: "i", header: "Issue", cell: (r) => r.message }, { key: "d", header: "Since", cell: (r) => date(r.since) }]} />
    <div id="reconciliation" className="mt-6">
      <Card title="Financial reconciliation" action={<span className="flex gap-2 text-xs">{["discrepancy", "incomplete", "reconciled"].map((st) =>
        <Link key={st} href={`?recon=${st}#reconciliation`} className={st === recon ? "font-semibold text-fg" : "text-link"}>{label(st)} ({rc(st)})</Link>)}</span>}>
        <p className="mb-3 text-sm text-muted">Won opportunity TCV must equal its accepted quotation, agreement value must equal the won opportunity, and scheduled billing must not exceed the contract value.</p>
        <DataTable rows={d.checks} href={(r) => r.link} empty={`No ${recon} checks.`} columns={[
          { key: "e", header: "Record", cell: (r) => r.entity_label }, { key: "c", header: "Check", cell: (r) => r.label },
          { key: "s", header: "Source", align: "end", cell: (r) => money(r.source_value, d.cur) }, { key: "x", header: "Should equal", align: "end", cell: (r) => money(r.comparison_value, d.cur) },
          { key: "v", header: "Difference", align: "end", cell: (r) => (r.source_value && r.comparison_value ? money(new D(r.source_value).minus(r.comparison_value).toFixed(2), d.cur) : "—") },
          { key: "t", header: "Status", cell: (r) => <Badge tone={r.status === "reconciled" ? "ok" : r.status === "discrepancy" ? "bad" : "warn"}>{label(r.status)}</Badge> }]} />
      </Card>
    </div>
  </>);
}
