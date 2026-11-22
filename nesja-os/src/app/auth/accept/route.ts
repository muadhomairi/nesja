import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/server/session";
import { acceptInvitationAction } from "@/app/actions/org";
/** Invitation acceptance. A route handler (not a page) so it may set the organization cookie. */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? "";
  if (!/^[0-9a-f]{48}$/.test(token)) return NextResponse.redirect(new URL("/login?error=invite", req.url));
  if (!(await getSession())) return NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(`/auth/accept?token=${token}`)}`, req.url));
  const result = await acceptInvitationAction(token);
  const home = req.nextUrl.searchParams.get("setpw") === "1" ? "/auth/reset?next=/launcher" : "/launcher";
  return NextResponse.redirect(new URL(result === "ok" ? home : `/launcher?invite_error=${encodeURIComponent(result)}`, req.url));
}
