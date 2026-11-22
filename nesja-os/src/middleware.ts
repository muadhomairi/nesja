import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/login", "/signup", "/auth/", "/demo", "/api/health", "/setup-required"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC.some((p) => path === p || path.startsWith(p));
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return isPublic || path === "/" ? NextResponse.next() : NextResponse.redirect(new URL("/setup-required", request.url));
  }
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (toSet) => {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = path !== "/" ? `?next=${encodeURIComponent(path)}` : "";
    return NextResponse.redirect(url);
  }
  // MFA: a user with a verified factor must reach aal2 before seeing anything but the MFA page.
  if (user && !isPublic) {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (data && data.nextLevel === "aal2" && data.currentLevel !== "aal2") {
      return NextResponse.redirect(new URL(`/auth/mfa?next=${encodeURIComponent(path)}`, request.url));
    }
  }
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2)$).*)"] };
