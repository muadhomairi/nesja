/**
 * Simple in-memory sliding-window limiter. Good enough for a single instance
 * and local development. On serverless/multi-instance hosting, replace with a
 * shared store (e.g. Upstash Redis, Vercel KV) — same function signature.
 */
const hits = new Map<string, number[]>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= limit) { hits.set(key, recent); return false; }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return true;
}
