import "server-only";
import { createHash } from "node:crypto";
import { withSystem } from "./db";
/** Fixed-window rate limit stored in Postgres (works across serverless instances). Fails open only if the DB is down. */
export async function rateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const k = createHash("sha256").update(key).digest("hex");
  try {
    const r = await withSystem((db) => db.query<{ hits: number }>(`insert into private.rate_limits(key, window_start, hits)
      values ($1, to_timestamp(floor(extract(epoch from now()) / $2) * $2), 1)
      on conflict (key, window_start) do update set hits = private.rate_limits.hits + 1 returning hits`, [k, windowSeconds]));
    return r.rows[0].hits <= max;
  } catch { return true; }
}
