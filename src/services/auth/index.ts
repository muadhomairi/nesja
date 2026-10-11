/**
 * Sign-in architecture. The marketing site never handles passwords: it hands
 * the user to the NESJA application's identity flow.
 *
 * AUTH_PROVIDER:
 *   none (default)  → sign-in explains the app isn't connected in this environment
 *   nesja-app       → redirect to {NEXT_PUBLIC_APP_URL}{AUTH_LOGIN_PATH}?login_hint=email
 *   oidc            → build an OpenID Connect authorization URL (OIDC_ISSUER, OIDC_CLIENT_ID, OIDC_REDIRECT_URI)
 * ▶ REPLACE "none" once the NESJA application URL is live.
 */
import { randomBytes } from "node:crypto";
import { optionalEnv, requireEnv } from "@/lib/server/env";

export type SignInResult =
  | { status: "redirect"; url: string }
  | { status: "not_configured"; message: string };

export async function beginSignIn(email: string): Promise<SignInResult> {
  const provider = optionalEnv("AUTH_PROVIDER", "none");

  if (provider === "nesja-app") {
    const base = requireEnv("NEXT_PUBLIC_APP_URL").replace(/\/$/, "");
    const url = new URL(`${base}${optionalEnv("AUTH_LOGIN_PATH", "/login")}`);
    url.searchParams.set("login_hint", email);
    return { status: "redirect", url: url.toString() };
  }

  if (provider === "oidc") {
    const issuer = requireEnv("OIDC_ISSUER").replace(/\/$/, "");
    const discovery = (await (await fetch(`${issuer}/.well-known/openid-configuration`)).json()) as { authorization_endpoint: string };
    const url = new URL(discovery.authorization_endpoint);
    url.search = new URLSearchParams({
      client_id: requireEnv("OIDC_CLIENT_ID"), redirect_uri: requireEnv("OIDC_REDIRECT_URI"), response_type: "code",
      scope: "openid email profile", login_hint: email, state: randomBytes(16).toString("hex"),
    }).toString();
    return { status: "redirect", url: url.toString() };
  }

  return { status: "not_configured", message: "Sign-in to the NESJA application isn't connected in this environment yet. If you're a customer, use the sign-in link from your NESJA administrator." };
}
