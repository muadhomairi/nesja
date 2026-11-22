"use server";
import { randomBytes } from "node:crypto";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";
import { withSystem } from "@/lib/server/db";
import { rateLimit } from "@/lib/server/rate-limit";
import { env } from "@/lib/env";
import { TENANT_COOKIE } from "@/lib/server/session";
import type { FormState } from "./validation";

/**
 * Starts a private demo session: a throwaway user with the read-only Executive role in the shared, synthetic
 * Northstar tenant. Abuse protection: 3 sessions per network per hour; demo users are deleted after 24 hours.
 */
export async function startDemo(_: FormState, _form?: FormData): Promise<FormState> {
  const tenant = env.demoTenantId();
  if (!tenant) return { ok: false, message: "The demonstration environment is not loaded yet." };
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await rateLimit(`demo:${ip}`, 3, 3600))) return { ok: false, message: "You've started several demos recently. Try again in an hour." };
  const email = `demo-${randomBytes(6).toString("hex")}@demo.nesja.invalid`;
  const password = randomBytes(24).toString("base64url");
  const admin = supabaseAdmin();
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: "Demo visitor", demo: true } });
  if (error || !data.user) return { ok: false, message: "The demo could not start. Try again shortly." };
  const uid = data.user.id;
  await withSystem(async (db) => {
    await db.query("insert into public.profiles(user_id, email, full_name, last_tenant_id) values ($1, $2, 'Demo visitor', $3)", [uid, email, tenant]);
    await db.query(`insert into public.memberships(tenant_id, user_id, role_id, status)
      select $1, $2, id, 'active' from public.roles where tenant_id = $1 and key = 'executive'`, [tenant, uid]);
    await db.query("insert into public.jobs(tenant_id, kind, payload, run_after) values ($1, 'demo_user_expire', $2, now() + interval '24 hours')", [tenant, { user_id: uid }]);
    await db.query("insert into public.audit_log(tenant_id, actor_user_id, actor_kind, action, entity) values ($1, $2, 'system', 'demo_session_start', 'auth')", [tenant, uid]);
  });
  const supabase = await supabaseServer();
  await supabase.auth.signInWithPassword({ email, password });
  (await cookies()).set(TENANT_COOKIE, tenant, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  redirect("/demo/journeys");
}
