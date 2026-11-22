/** Environment access. Server-only values throw when missing so a misconfiguration fails loudly, never silently. */
function need(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable ${name}. See nesja-os/.env.example.`);
  return v;
}
export const env = {
  supabaseUrl: () => need("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => need("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  serviceRoleKey: () => need("SUPABASE_SERVICE_ROLE_KEY"),
  databaseUrl: () => need("DATABASE_URL"),
  siteUrl: () => process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3100",
  /** Public URL of the deployed NESJA Engage app. Empty = not deployed, and the launcher says so. */
  engageUrl: () => process.env.NEXT_PUBLIC_ENGAGE_URL || "",
  websiteUrl: () => process.env.NEXT_PUBLIC_WEBSITE_URL || "https://www.nesja.ai",
  demoTenantId: () => process.env.DEMO_TENANT_ID || "",
};
export const isConfigured = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && process.env.DATABASE_URL);
