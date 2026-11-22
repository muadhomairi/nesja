import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/** Supabase client bound to the visitor's cookies. Used for Auth only; business data goes through lib/server/db. */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(env.supabaseUrl(), env.supabaseAnonKey(), {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (toSet) => { try { toSet.forEach(({ name, value, options }) => store.set(name, value, options)); } catch { /* server component */ } },
    },
  });
}

/** Service-role client for Auth administration (invites, demo users). Server-only; never sent to the browser. */
export function supabaseAdmin() {
  return createClient(env.supabaseUrl(), env.serviceRoleKey(), { auth: { autoRefreshToken: false, persistSession: false } });
}
