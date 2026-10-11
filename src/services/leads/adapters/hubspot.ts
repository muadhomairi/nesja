/**
 * HubSpot Forms adapter (interim CRM option before NESJA ingestion).
 * Requires: HUBSPOT_PORTAL_ID, HUBSPOT_FORM_GUID (one form; map fields in HubSpot).
 */
import { requireEnv } from "@/lib/server/env";
import type { LeadAdapter } from "../types";

export const hubspotLeadAdapter: LeadAdapter = {
  id: "hubspot",
  async submit(lead) {
    const [firstname, ...rest] = (lead.contact.name ?? "").split(" ");
    const fields = Object.entries({
      email: lead.contact.email, firstname, lastname: rest.join(" "), company: lead.contact.company, jobtitle: lead.contact.role,
      country: lead.contact.country, nesja_lead_type: lead.type, ...lead.details,
      utm_source: lead.attribution?.lastTouch?.source, utm_medium: lead.attribution?.lastTouch?.medium, utm_campaign: lead.attribution?.lastTouch?.campaign,
    }).filter(([, v]) => v !== undefined && v !== "").map(([name, value]) => ({ name, value: String(value) }));

    const res = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${requireEnv("HUBSPOT_PORTAL_ID")}/${requireEnv("HUBSPOT_FORM_GUID")}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fields, context: { pageUri: lead.meta.referer } }) },
    );
    if (!res.ok) throw new Error(`HubSpot responded ${res.status}`);
    return { id: `hubspot_${Date.now()}`, adapter: "hubspot" };
  },
};
