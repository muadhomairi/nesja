import { contactSchema } from "@/lib/validation";
import { json, parseBody, requestMeta } from "@/lib/server/http";
import { getLeadService } from "@/services/leads";
import { contactAcknowledgement } from "@/services/email/templates";
import { notifyTeam, safeSend } from "@/services/notify";

export async function POST(req: Request) {
  const parsed = await parseBody(req, contactSchema);
  if ("response" in parsed) return parsed.response;
  const d = parsed.data;
  if (d.website) return json({ ok: true, id: "ignored" }); // honeypot

  try {
    const result = await getLeadService().submit({
      type: "contact_sales",
      contact: { name: d.name, email: d.email, company: d.company, role: d.role, country: d.country || undefined },
      details: { message: d.message, enterprise: d.enterprise, companySize: d.companySize || undefined, estimatedUsers: d.estimatedUsers === "" ? undefined : d.estimatedUsers },
      attribution: d.attribution,
      meta: requestMeta(req),
    });
    await Promise.all([safeSend({ to: d.email, ...contactAcknowledgement({ name: d.name }) }), notifyTeam("contact_sales", { ...d, attribution: d.attribution?.lastTouch })]);
    return json({ ok: true, id: result.id });
  } catch (e) {
    console.error("[contact] lead submission failed", e);
    return json({ ok: false, error: "We couldn't send your message just now. Please try again in a moment." }, 502);
  }
}
