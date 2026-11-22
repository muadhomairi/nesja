import "server-only";
import { Pool, type PoolClient, types } from "pg";
import { env } from "@/lib/env";

// numeric stays a STRING (exact money; convert with lib/finance), date stays 'YYYY-MM-DD', bigint counts -> number.
types.setTypeParser(1082, (v) => v);
types.setTypeParser(20, (v) => (v === null ? null : Number(v)));

const g = globalThis as unknown as { __nesjaPool?: Pool };
function pool(): Pool {
  if (!g.__nesjaPool) {
    const connectionString = env.databaseUrl();
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString);
    const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n");
    g.__nesjaPool = new Pool({
      connectionString,
      ssl: local ? false : ca ? { ca, rejectUnauthorized: true } : { rejectUnauthorized: false },
      max: Number(process.env.DB_POOL_SIZE ?? 10),
      idleTimeoutMillis: 30_000,
    });
  }
  return g.__nesjaPool;
}

export type Db = PoolClient;

/**
 * Runs fn in one transaction exactly as Supabase's API would for this user: role `authenticated` and the verified
 * user id in request.jwt.claims. Every RLS policy, trigger and audit rule applies; there is no app-side bypass.
 */
export async function withUser<T>(userId: string, fn: (db: Db) => Promise<T>, opts?: { actorKind?: "user" | "ai" }): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("begin; set local role authenticated; set local jit = off");
    await client.query("select set_config('request.jwt.claims', $1, true)", [JSON.stringify({ sub: userId, role: "authenticated" })]);
    if (opts?.actorKind === "ai") await client.query("select set_config('nesja.actor_kind', 'ai', true)");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (e) {
    await client.query("rollback").catch(() => undefined);
    throw e;
  } finally {
    client.release();
  }
}

/** Privileged access for platform bookkeeping only (demo sessions, rate limits, jobs). Never for user-driven reads. */
export async function withSystem<T>(fn: (db: Db) => Promise<T>): Promise<T> {
  const client = await pool().connect();
  try {
    await client.query("begin; set local nesja.actor_kind = 'system'");
    const result = await fn(client);
    await client.query("commit");
    return result;
  } catch (e) {
    await client.query("rollback").catch(() => undefined);
    throw e;
  } finally {
    client.release();
  }
}

export async function one<T = Record<string, unknown>>(db: Db, sql: string, params: unknown[] = []): Promise<T | null> {
  return ((await db.query(sql, params)).rows[0] as T) ?? null;
}
export async function many<T = Record<string, unknown>>(db: Db, sql: string, params: unknown[] = []): Promise<T[]> {
  return (await db.query(sql, params)).rows as T[];
}

export function dbErrorMessage(error: unknown): string {
  const e = error as { code?: string; message?: string; detail?: string };
  if (!e) return "Unexpected error";
  if (e.code === "42501") return e.message?.startsWith("permission denied") || e.message?.includes("row-level security") ? "You do not have permission to do that." : e.message ?? "Permission denied";
  if (e.code === "23505") return "This already exists. Open the existing record instead.";
  if (e.code === "23503") return "A linked record does not exist or is not visible to you.";
  if (e.code === "23514") return "A value is not allowed here. Check what you entered.";
  if (e.code === "54000" || e.code === "22023" || e.code === "28000") return e.message ?? "Request refused";
  return "Something went wrong. Nothing was saved.";
}
