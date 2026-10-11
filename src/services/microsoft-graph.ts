/**
 * Microsoft Graph app-only token helper, shared by Microsoft Bookings
 * scheduling and Microsoft Graph email.
 * Requires: MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET.
 */
import { requireEnv } from "@/lib/server/env";

let cached: { token: string; expires: number } | null = null;

export async function graphToken() {
  if (cached && cached.expires > Date.now() + 60_000) return cached.token;
  const res = await fetch(`https://login.microsoftonline.com/${requireEnv("MS_TENANT_ID")}/oauth2/v2.0/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: requireEnv("MS_CLIENT_ID"), client_secret: requireEnv("MS_CLIENT_SECRET"), scope: "https://graph.microsoft.com/.default", grant_type: "client_credentials" }),
  });
  if (!res.ok) throw new Error(`Microsoft identity token ${res.status}`);
  const data = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: data.access_token, expires: Date.now() + data.expires_in * 1000 };
  return cached.token;
}

export async function graph(path: string, init?: RequestInit) {
  return fetch(`https://graph.microsoft.com/v1.0${path}`, { ...init, headers: { Authorization: `Bearer ${await graphToken()}`, "Content-Type": "application/json", ...init?.headers } });
}
