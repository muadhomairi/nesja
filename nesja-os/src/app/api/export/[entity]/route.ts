import { NextResponse } from "next/server";
import { getSession } from "@/lib/server/session";
import { many, withSystem, withUser } from "@/lib/server/db";
import { csvCell } from "@/lib/csv";

/** CSV exports. Queries run as the signed-in user, so RLS and record scope decide what is exported. Needs data.export. */
const EXPORTS: Record<string, { perm: string; sql: string }> = {
  accounts: { perm: "account.view", sql: "select number, name, industry, country, segment, created_at from public.accounts where tenant_id = $1 and archived_at is null order by name" },
  opportunities: { perm: "opportunity.view", sql: `select o.number, o.name, a.name as account, o.stage, o.revenue_type, o.term_months, o.tcv, o.acv, o.probability, o.weighted_value, o.expected_close, o.closed_at
    from public.opportunities o join public.accounts a on a.tenant_id = o.tenant_id and a.id = o.account_id where o.tenant_id = $1 order by o.expected_close nulls last` },
  agreements: { perm: "agreement.view", sql: `select g.title, a.name as account, g.status, g.contract_value, g.start_date, g.end_date from public.agreements g
    join public.accounts a on a.tenant_id = g.tenant_id and a.id = g.account_id where g.tenant_id = $1 order by g.end_date nulls last` },
  renewals: { perm: "renewal.view", sql: `select g.title as agreement, r.due_date, r.current_value, r.proposed_value, r.risk, r.status from public.renewals r
    join public.agreements g on g.tenant_id = r.tenant_id and g.id = r.agreement_id where r.tenant_id = $1 order by r.due_date` },
  actuals: { perm: "finance.view", sql: `select f.period_month, a.name as account, g.title as agreement, f.currency, f.revenue, f.cost, f.budget_revenue from public.financial_actuals f
    join public.accounts a on a.tenant_id = f.tenant_id and a.id = f.account_id left join public.agreements g on g.tenant_id = f.tenant_id and g.id = f.agreement_id where f.tenant_id = $1 order by f.period_month, a.name` },
  "data-quality": { perm: "report.view", sql: "select severity, module, rule, message, entity_label, since from public.data_quality_issues where tenant_id = $1 order by array_position(array['critical','high','medium','low'], severity), since" },
  forecast: { perm: "report.view", sql: "select period_month, layer, amount from public.forecast_months where tenant_id = $1 order by period_month, layer" },
};

export async function GET(_req: Request, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const spec = EXPORTS[entity];
  if (!spec) return NextResponse.json({ error: "unknown export" }, { status: 404 });
  const s = await getSession();
  if (!s) return NextResponse.json({ error: "sign in required" }, { status: 401 });
  if (!s.org || !s.can("data.export") || !s.can(spec.perm)) return NextResponse.json({ error: "not permitted" }, { status: 403 });
  const org = s.org;
  const rows = await withUser(s.userId, (db) => many<Record<string, unknown>>(db, spec.sql, [org.id]));
  // The audit log is append-only and closed to users, so the export record is written by the server.
  await withSystem((db) => db.query("insert into public.audit_log(tenant_id, actor_user_id, actor_kind, action, entity, after) values ($1, $2, 'user', 'export', $3, jsonb_build_object('rows', $4::int))", [org.id, s.userId, entity, rows.length]));
  const cols = rows.length ? Object.keys(rows[0]) : [];
  const body = [cols.join(","), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\r\n") + "\r\n";
  return new NextResponse(body, { headers: {
    "content-type": "text/csv; charset=utf-8", "cache-control": "no-store",
    "content-disposition": `attachment; filename="${org.slug}-${entity}-${new Date().toISOString().slice(0, 10)}.csv"` } });
}
