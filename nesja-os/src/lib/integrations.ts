import "server-only";

/**
 * Integration registry. A status is derived only from configuration the server can see; nothing is reported as
 * connected unless its credentials are present. Secrets are read on the server and never sent to the browser.
 */
export type IntegrationStatus = "active" | "ready" | "blocked";
export type Integration = { key: string; name: string; purpose: string; status: IntegrationStatus; detail: string; needs: string[] };

const has = (...names: string[]) => names.every((n) => Boolean(process.env[n]));

export function integrations(): Integration[] {
  return [
    { key: "supabase", name: "Supabase (database, auth, storage)", purpose: "Tenant data, sign-in, MFA and document storage.",
      status: has("NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "DATABASE_URL") ? "active" : "blocked",
      detail: "Core platform service.", needs: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "DATABASE_URL"] },
    { key: "email", name: "Transactional e-mail", purpose: "Verification, password reset and invitation e-mails.",
      status: has("NEXT_PUBLIC_SUPABASE_URL") ? (has("SMTP_HOST") ? "active" : "ready") : "blocked",
      detail: has("SMTP_HOST") ? "Custom SMTP configured." : "Uses Supabase Auth's built-in mailer, which is rate limited. Configure custom SMTP in Supabase for production volume.", needs: ["SMTP_HOST (set in Supabase Auth settings)"] },
    { key: "jobs", name: "Scheduled jobs", purpose: "Expire demo users and run tenant deletion requests.",
      status: has("CRON_SECRET") ? "active" : "ready", detail: "Vercel Cron calls /api/jobs every 15 minutes with the shared secret.", needs: ["CRON_SECRET"] },
    { key: "ai", name: "NESJA assistant (AI provider)", purpose: "Grounded answers on records the user may see.",
      status: has("AI_PROVIDER_API_KEY") ? "ready" : "blocked", detail: "No AI provider key is configured, so the assistant is off and produces no output.", needs: ["AI_PROVIDER_API_KEY", "AI_MODEL"] },
    { key: "billing", name: "Subscription billing", purpose: "Collect subscription payments.",
      status: "blocked", detail: "Off until NESJA approves commercial terms and prices, and payment provider credentials exist.", needs: ["Approved price list", "Payment provider keys"] },
    { key: "calendar", name: "Microsoft 365 / Google Workspace", purpose: "Sync activities and meetings.",
      status: has("MS_GRAPH_CLIENT_ID") || has("GOOGLE_CLIENT_ID") ? "ready" : "blocked", detail: "Not connected. Activities are recorded in NESJA only.", needs: ["MS_GRAPH_CLIENT_ID / GOOGLE_CLIENT_ID and secret"] },
    { key: "esign", name: "E-signature", purpose: "Send agreements for signature.",
      status: "blocked", detail: "Not connected. Agreement status is updated manually.", needs: ["E-signature provider account and API key"] },
    { key: "erp", name: "Accounting / ERP actuals", purpose: "Load monthly revenue and cost actuals automatically.",
      status: "blocked", detail: "Not connected. Actuals arrive through CSV import.", needs: ["ERP API credentials"] },
  ];
}
