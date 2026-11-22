import { redirect } from "next/navigation";
import { AuthFrame } from "@/components/shell/auth-frame";
import { Notice, ButtonLink } from "@/components/ui/primitives";
import { getSession } from "@/lib/server/session";
import { acceptInvitationAction } from "@/app/actions/org";
export const metadata = { title: "Join organization" };
export default async function Accept({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token || !/^[0-9a-f]{48}$/.test(token)) return <AuthFrame title="Invitation link not valid"><Notice tone="bad">Ask your administrator for a new invitation.</Notice></AuthFrame>;
  const s = await getSession();
  if (!s) redirect(`/login?next=${encodeURIComponent(`/auth/accept?token=${token}`)}`);
  const result = await acceptInvitationAction(token);
  if (result === "ok") redirect("/launcher");
  return <AuthFrame title="Could not join"><Notice tone="bad">{result}</Notice><div className="mt-4"><ButtonLink href="/launcher" variant="secondary">Go to NESJA</ButtonLink></div></AuthFrame>;
}
