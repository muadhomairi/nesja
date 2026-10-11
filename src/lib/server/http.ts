import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { fieldErrors } from "@/lib/validation";
import { rateLimit } from "./rate-limit";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });

export const clientIp = (req: Request) =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";

/** Parse + validate a JSON body. Returns either data or a ready error response. */
export async function parseBody<T>(req: Request, schema: ZodSchema<T>): Promise<{ data: T } | { response: NextResponse }> {
  if (!rateLimit(`${new URL(req.url).pathname}:${clientIp(req)}`, 10, 60_000)) {
    return { response: json({ ok: false, error: "Too many requests. Please wait a minute and try again." }, 429) };
  }
  let body: unknown;
  try { body = await req.json(); } catch { return { response: json({ ok: false, error: "Invalid request body." }, 400) }; }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return { response: json({ ok: false, error: "Please check the highlighted fields.", fieldErrors: fieldErrors(parsed.error) }, 422) };
  return { data: parsed.data };
}

export function requestMeta(req: Request) {
  return { userAgent: req.headers.get("user-agent") || "", referer: req.headers.get("referer") || "", submittedAt: new Date().toISOString() };
}
