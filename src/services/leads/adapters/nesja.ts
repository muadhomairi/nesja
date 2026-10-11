/**
 * PRODUCTION TARGET — posts website leads directly into NESJA.OS.
 * "NESJA uses NESJA to sell NESJA."
 * Requires: NESJA_API_URL, NESJA_API_KEY. Adjust the endpoint path/payload
 * to match the NESJA public API once it is published.
 */
import { requireEnv } from "@/lib/server/env";
import type { LeadAdapter } from "../types";

export const nesjaLeadAdapter: LeadAdapter = {
  id: "nesja",
  async submit(lead) {
    const base = requireEnv("NESJA_API_URL").replace(/\/$/, "");
    const res = await fetch(`${base}/v1/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${requireEnv("NESJA_API_KEY")}` },
      body: JSON.stringify({
        source: "website",
        type: lead.type,
        contact: lead.contact,
        details: lead.details,
        attribution: lead.attribution,
        meta: lead.meta,
      }),
    });
    if (!res.ok) throw new Error(`NESJA API responded ${res.status}`);
    const data = (await res.json().catch(() => ({}))) as { id?: string };
    return { id: data.id ?? "nesja", adapter: "nesja" };
  },
};
