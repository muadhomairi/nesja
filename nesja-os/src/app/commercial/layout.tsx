import { redirect } from "next/navigation";
import { requireOrg } from "@/lib/server/session";
import { one, withUser } from "@/lib/server/db";
import { AppShell } from "@/components/shell/app-shell";
export default async function CommercialLayout({ children }: { children: React.ReactNode }) {
  const s = await requireOrg();
  if (!s.entitlements.commercial) redirect("/launcher");
  const unread = await withUser(s.userId, (db) => one<{ n: number }>(db, "select count(*)::int as n from public.notifications where tenant_id = $1 and user_id = auth.uid() and read_at is null", [s.org.id]));
  return <AppShell session={s} unread={unread?.n ?? 0}>{children}</AppShell>;
}
