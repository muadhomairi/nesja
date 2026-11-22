"use server";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/server/session";
import { withUser } from "@/lib/server/db";
export async function setTenantStatus(id: string, status: string) {
  const s = await requireSession();
  if (!s.isPlatformAdmin || !/^[0-9a-f-]{36}$/.test(id) || !["trial", "active", "suspended", "closed"].includes(status)) return;
  await withUser(s.userId, (db) => db.query("select public.set_tenant_status($1, $2::public.tenant_status, 'platform console')", [id, status]));
  revalidatePath("/admin/platform");
}
