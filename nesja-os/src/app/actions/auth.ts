"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { supabaseServer } from "@/lib/supabase/server";
import { withSystem } from "@/lib/server/db";
import { env } from "@/lib/env";
import { email, password, safeNext, type FormState } from "./validation";
import { rateLimit } from "@/lib/server/rate-limit";

async function clientIp() { const h = await headers(); return h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"; }

async function authAudit(action: string, userId: string | null, detail: Record<string, unknown>) {
  await withSystem((db) => db.query("insert into public.audit_log(actor_user_id, actor_kind, action, entity, after) values ($1, 'user', $2, 'auth', $3)", [userId, action, detail])).catch(() => undefined);
}

export async function loginAction(_: FormState, form: FormData): Promise<FormState> {
  const e = email.safeParse(form.get("email"));
  const pw = String(form.get("password") ?? "");
  if (!e.success || !pw) return { ok: false, message: "Enter your e-mail and password." };
  if (!(await rateLimit(`login:${await clientIp()}`, 10, 900))) return { ok: false, message: "Too many attempts. Wait 15 minutes and try again." };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email: e.data, password: pw });
  if (error || !data.user) {
    await authAudit("login_failed", null, { email: e.data, reason: error?.code ?? "unknown" });
    return { ok: false, message: error?.code === "email_not_confirmed" ? "Confirm your e-mail first. We sent you a link." : "E-mail or password is not correct." };
  }
  await authAudit("login", data.user.id, {});
  redirect(safeNext(form.get("next")));
}

export async function signupAction(_: FormState, form: FormData): Promise<FormState> {
  const e = email.safeParse(form.get("email"));
  if (!e.success) return { ok: false, message: e.error.issues[0].message };
  const p = password.safeParse(form.get("password"));
  if (!p.success) return { ok: false, message: p.error.issues[0].message };
  const name = String(form.get("full_name") ?? "").trim().slice(0, 120);
  if (!(await rateLimit(`signup:${await clientIp()}`, 5, 3600))) return { ok: false, message: "Too many sign-ups from this network. Try again later." };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signUp({ email: e.data, password: p.data, options: { data: { full_name: name }, emailRedirectTo: `${env.siteUrl()}/auth/callback?next=/onboarding` } });
  if (error) return { ok: false, message: error.code === "user_already_exists" ? "An account with this e-mail already exists. Sign in instead." : "We could not create the account. Try again." };
  return { ok: true, message: "Check your inbox: we sent a link to confirm your e-mail." };
}

export async function forgotAction(_: FormState, form: FormData): Promise<FormState> {
  const e = email.safeParse(form.get("email"));
  if (!e.success) return { ok: false, message: "Enter a valid e-mail." };
  if (await rateLimit(`forgot:${await clientIp()}`, 5, 3600)) {
    const supabase = await supabaseServer();
    await supabase.auth.resetPasswordForEmail(e.data, { redirectTo: `${env.siteUrl()}/auth/callback?next=/auth/reset` });
  }
  // Same answer whether or not the address exists, so the form cannot be used to discover accounts.
  return { ok: true, message: "If that address has an account, a reset link is on its way." };
}

export async function resetAction(_: FormState, form: FormData): Promise<FormState> {
  const p = password.safeParse(form.get("password"));
  if (!p.success) return { ok: false, message: p.error.issues[0].message };
  if (form.get("password") !== form.get("confirm")) return { ok: false, message: "The two passwords do not match." };
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.updateUser({ password: p.data });
  if (error) return { ok: false, message: "The reset link has expired. Request a new one." };
  await authAudit("password_reset", data.user?.id ?? null, {});
  redirect(safeNext(form.get("next")));
}

export async function signOutAction() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  await supabase.auth.signOut();
  await authAudit("logout", data.user?.id ?? null, {});
  redirect("/login");
}
