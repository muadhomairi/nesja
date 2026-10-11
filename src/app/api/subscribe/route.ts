import { subscribeSchema } from "@/lib/validation";
import { json, parseBody, requestMeta } from "@/lib/server/http";
import { getLeadService } from "@/services/leads";

export async function POST(req: Request) {
  const parsed = await parseBody(req, subscribeSchema);
  if ("response" in parsed) return parsed.response;
  const d = parsed.data;
  if (d.website) return json({ ok: true });
  try {
    await getLeadService().submit({ type: "subscription", contact: { email: d.email }, details: { location: d.location }, attribution: d.attribution, meta: requestMeta(req) });
    return json({ ok: true });
  } catch (e) {
    console.error("[subscribe] failed", e);
    return json({ ok: false, error: "We couldn't subscribe you just now. Please try again." }, 502);
  }
}
