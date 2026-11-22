import { NextResponse, type NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { withSystem } from "@/lib/server/db";
import { supabaseAdmin } from "@/lib/supabase/server";
/** Background job runner (Vercel Cron). Executes queued jobs: demo-user expiry and tenant export/delete. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET ?? "";
  const got = req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "";
  if (secret.length < 16 || got.length !== secret.length || !timingSafeEqual(Buffer.from(got), Buffer.from(secret))) return new NextResponse("Unauthorized", { status: 401 });
  const done: string[] = [];
  const jobs = await withSystem((db) => db.query<{ id: number; tenant_id: string; kind: string; payload: { user_id?: string } }>(`update public.jobs set status = 'running', locked_at = now(), attempts = attempts + 1
    where id in (select id from public.jobs where status = 'queued' and run_after <= now() order by run_after limit 25 for update skip locked) returning id, tenant_id, kind, payload`));
  for (const j of jobs.rows) {
    try {
      if (j.kind === "demo_user_expire" && j.payload.user_id) await supabaseAdmin().auth.admin.deleteUser(j.payload.user_id);
      else if (j.kind === "tenant_delete") await withSystem((db) => db.query("delete from public.tenants where id = $1 and kind <> 'internal'", [j.tenant_id]));
      else if (j.kind === "tenant_export") { /* export bundle writer: see docs/OPERATIONS.md (pending storage bucket for exports) */ throw new Error("tenant_export writer not implemented yet"); }
      await withSystem((db) => db.query("update public.jobs set status = 'done' where id = $1", [j.id]));
      done.push(`${j.kind}:${j.id}`);
    } catch (e) {
      await withSystem((db) => db.query("update public.jobs set status = case when attempts >= 5 then 'failed' else 'queued' end, last_error = $2, run_after = now() + interval '10 minutes' where id = $1", [j.id, String((e as Error).message).slice(0, 500)]));
    }
  }
  return NextResponse.json({ processed: done.length, done });
}
