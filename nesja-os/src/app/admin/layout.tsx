import { requireOrg } from "@/lib/server/session";
import { AppShell } from "@/components/shell/app-shell";
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const s = await requireOrg();
  return <AppShell session={s}>{children}</AppShell>;
}
