import { NextResponse } from "next/server";
import { withSystem } from "@/lib/server/db";
import { isConfigured } from "@/lib/env";
import { RELEASE } from "@/design-system/version";
/** Liveness + database round trip. Used by smoke tests and uptime monitoring. No tenant data. */
export async function GET() {
  if (!isConfigured()) return NextResponse.json({ ok: false, release: RELEASE, db: "not_configured" }, { status: 503 });
  try {
    const r = await withSystem((db) => db.query<{ m: number }>("select count(*)::int as m from supabase_migrations.schema_migrations").catch(() => db.query<{ m: number }>("select -1 as m")));
    return NextResponse.json({ ok: true, release: RELEASE, db: "ok", migrations: r.rows[0].m }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ ok: false, release: RELEASE, db: "error" }, { status: 503 }); }
}
