"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireSession, TENANT_COOKIE } from "@/lib/server/session";
import { dbErrorMessage, one, withUser } from "@/lib/server/db";
import { supabaseAdmin } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import type { FormState } from "./validation";

export async function switchOrg(tenantId: string) {
  const s = await requireSession();
  if (!s.orgs.some((o) => o.id === tenantId)) return;
  (await cookies()).set(TENANT_COOKIE, tenantId, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  await withUser(s.userId, (db) => db.query("update public.profiles set last_tenant_id = $1 where user_id = auth.uid()", [tenantId]));
  revalidatePath("/", "layout");
}

const orgSchema = z.object({
  name: z.string().trim().min(2, "Name the organization").max(200),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9][a-z0-9-]{1,62}$/, "Use lowercase letters, numbers and dashes"),
  currency: z.string().regex(/^[A-Z]{3}$/).default("USD"),
});

export async function createOrgAction(_: FormState, form: FormData): Promise<FormState> {
  const s = await requireSession();
  const p = orgSchema.safeParse({ name: form.get("name"), slug: form.get("slug"), currency: form.get("currency") || "USD" });
  if (!p.success) return { ok: false, message: p.error.issues[0].message };
  let id: string;
  try {
    id = (await withUser(s.userId, (db) => one<{ id: string }>(db, "select public.create_organization($1, $2, $3) as id", [p.data.name, p.data.slug, p.data.currency])))!.id;
  } catch (e) { return { ok: false, message: dbErrorMessage(e) }; }
  (await cookies()).set(TENANT_COOKIE, id, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
  redirect("/onboarding?step=configure");
}

export async function inviteAction(_: FormState, form: FormData): Promise<FormState> {
  const s = await requireSession();
  if (!s.org || !s.can("admin.users")) return { ok: false, message: "You cannot invite users here." };
  const emailV = z.string().trim().toLowerCase().email().safeParse(form.get("email"));
  const role = String(form.get("role") ?? "account_manager");
  if (!emailV.success) return { ok: false, message: "Enter a valid e-mail." };
  try {
    const token = (await withUser(s.userId, (db) => one<{ t: string }>(db, "select public.invite_member($1, $2, $3) as t", [s.org!.id, emailV.data, role])))!.t;
    const link = `${env.siteUrl()}/auth/accept?token=${token}`;
    // Supabase sends the e-mail (its SMTP settings). Existing users receive a magic link that lands on the same page.
    const { error } = await supabaseAdmin().auth.admin.inviteUserByEmail(emailV.data, { redirectTo: `${env.siteUrl()}/auth/confirm?setpw=1&next=${encodeURIComponent(`/auth/accept?token=${token}`)}`, data: { invited_to: s.org.name } });
    if (error && /already been registered/i.test(error.message)) return { ok: true, message: `${emailV.data} already has a NESJA account. Share this link with them: ${link}` };
    if (error) return { ok: true, message: `Invitation created, but the e-mail could not be sent. Share this link: ${link}` };
    return { ok: true, message: `Invitation sent to ${emailV.data}.` };
  } catch (e) { return { ok: false, message: dbErrorMessage(e) }; }
}

export async function acceptInvitationAction(token: string): Promise<string> {
  const s = await requireSession();
  try {
    const t = await withUser(s.userId, (db) => one<{ id: string }>(db, "select public.accept_invitation($1) as id", [token]));
    (await cookies()).set(TENANT_COOKIE, t!.id, { httpOnly: true, sameSite: "lax", secure: true, path: "/" });
    return "ok";
  } catch (e) { return dbErrorMessage(e); }
}
