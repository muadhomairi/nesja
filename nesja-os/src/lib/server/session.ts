import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { many, one, withUser, type Db } from "@/lib/server/db";

export type Scope = "own" | "business_unit" | "all";
export type Org = { id: string; slug: string; name: string; kind: "customer" | "demo" | "internal"; status: string; base_currency: string; role_key: string; role_name: string };
export type Session = {
  userId: string; email: string; fullName: string | null; isPlatformAdmin: boolean;
  orgs: Org[]; org: Org | null; permissions: Map<string, Scope>;
  can: (code: string) => boolean; scope: (code: string) => Scope | null;
  entitlements: Record<string, boolean>;
};

export const TENANT_COOKIE = "nesja_org";

export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const chosen = (await cookies()).get(TENANT_COOKIE)?.value;
  return withUser(user.id, async (db) => {
    const profile = await one<{ full_name: string | null; is_platform_admin: boolean; last_tenant_id: string | null }>(db,
      "select full_name, is_platform_admin, last_tenant_id from public.profiles where user_id = auth.uid()");
    const orgs = await many<Org>(db, `select t.id, t.slug, t.name, t.kind, t.status, t.base_currency, r.key as role_key, r.name as role_name
      from public.memberships m join public.tenants t on t.id = m.tenant_id join public.roles r on r.tenant_id = m.tenant_id and r.id = m.role_id
      where m.user_id = auth.uid() and m.status = 'active' order by t.kind = 'demo', t.name`);
    const org = orgs.find((o) => o.id === chosen) ?? orgs.find((o) => o.id === profile?.last_tenant_id) ?? orgs[0] ?? null;
    const permissions = new Map<string, Scope>();
    const entitlements: Record<string, boolean> = {};
    if (org) {
      for (const p of await many<{ permission_code: string; scope: Scope }>(db, `select rp.permission_code, rp.scope from public.memberships m
          join public.role_permissions rp on rp.tenant_id = m.tenant_id and rp.role_id = m.role_id where m.tenant_id = $1 and m.user_id = auth.uid()`, [org.id]))
        permissions.set(p.permission_code, p.scope);
      for (const e of await many<{ product_code: string; enabled: boolean }>(db, "select product_code, enabled from public.entitlements where tenant_id = $1", [org.id]))
        entitlements[e.product_code] = e.enabled;
    }
    return {
      userId: user.id, email: user.email ?? "", fullName: profile?.full_name ?? null, isPlatformAdmin: profile?.is_platform_admin ?? false,
      orgs, org, permissions, entitlements, can: (c) => permissions.has(c), scope: (c) => permissions.get(c) ?? null,
    };
  });
});

export async function requireSession(): Promise<Session> {
  const s = await getSession();
  if (!s) redirect("/login");
  return s;
}

/** Signed in, inside an active organization, optionally holding a permission. */
export async function requireOrg(permission?: string): Promise<Session & { org: Org }> {
  const s = await requireSession();
  if (!s.org) redirect("/onboarding");
  if (permission && !s.can(permission)) redirect("/forbidden");
  return s as Session & { org: Org };
}

/** Run queries as the signed-in user (RLS applies). */
export async function asUser<T>(fn: (db: Db, s: Session & { org: Org }) => Promise<T>, permission?: string): Promise<T> {
  const s = await requireOrg(permission);
  return withUser(s.userId, (db) => fn(db, s));
}
