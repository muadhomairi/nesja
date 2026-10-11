import { z } from "zod";
import { json, parseBody } from "@/lib/server/http";
import { createCheckout } from "@/services/payments";
import { siteConfig } from "@/config/site";

const schema = z.object({ edition: z.enum(["essential", "professional"]), term: z.enum(["monthly", "12m", "24m", "36m"]), seats: z.number().int().min(1).max(10000), email: z.string().email().optional() });

export async function POST(req: Request) {
  const parsed = await parseBody(req, schema);
  if ("response" in parsed) return parsed.response;
  try {
    const result = await createCheckout({ ...parsed.data, successUrl: `${siteConfig.url}/signup?status=success`, cancelUrl: `${siteConfig.url}/pricing` });
    return json({ ok: result.status === "redirect", ...result }, result.status === "redirect" ? 200 : 501);
  } catch (e) {
    console.error("[checkout] failed", e);
    return json({ ok: false, error: "Checkout is unavailable." }, 502);
  }
}
