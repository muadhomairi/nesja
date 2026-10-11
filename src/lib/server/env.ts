/** Server-side environment access with clear errors for misconfigured adapters. */
export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new ConfigError(`Missing environment variable ${name}. See .env.example and docs/INTEGRATIONS.md.`);
  return v;
}
export const optionalEnv = (name: string, fallback = "") => process.env[name] || fallback;

export class ConfigError extends Error {
  constructor(message: string) { super(message); this.name = "ConfigError"; }
}
