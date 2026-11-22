import { requireSession } from "@/lib/server/session";
import { supabaseServer } from "@/lib/supabase/server";
import { AppShell } from "@/components/shell/app-shell";
import { Card, Notice, PageHeader } from "@/components/ui/primitives";
import { MfaEnroll } from "./mfa-enroll";
export const metadata = { title: "Your account" };
export default async function Account() {
  const s = await requireSession();
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.mfa.listFactors();
  const verified = data?.totp.filter((f) => f.status === "verified") ?? [];
  return (
    <AppShell session={s}>
      <PageHeader title="Your account" subtitle={s.email} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Two-step verification (TOTP)">{verified.length ? <Notice tone="ok">An authenticator app protects this account.</Notice> : <MfaEnroll />}</Card>
        <Card title="Session"><form action="/auth/signout" method="post"><button className="rounded-lg border border-line-strong px-3 py-2 text-sm font-semibold hover:bg-hover">Sign out</button></form></Card>
      </div>
    </AppShell>
  );
}
