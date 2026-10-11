/**
 * Generic webhook adapter (Zapier, Make, n8n, Power Automate, your own API).
 * Requires: LEAD_WEBHOOK_URL. Optional: LEAD_WEBHOOK_SECRET → sends an
 * HMAC-SHA256 signature in the X-Nesja-Signature header.
 */
import { createHmac, randomUUID } from "node:crypto";
import { optionalEnv, requireEnv } from "@/lib/server/env";
import type { LeadAdapter } from "../types";

export const webhookLeadAdapter: LeadAdapter = {
  id: "webhook",
  async submit(lead) {
    const id = `lead_${randomUUID()}`;
    const body = JSON.stringify({ id, ...lead });
    const secret = optionalEnv("LEAD_WEBHOOK_SECRET");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (secret) headers["X-Nesja-Signature"] = createHmac("sha256", secret).update(body).digest("hex");
    const res = await fetch(requireEnv("LEAD_WEBHOOK_URL"), { method: "POST", headers, body });
    if (!res.ok) throw new Error(`Lead webhook responded ${res.status}`);
    return { id, adapter: "webhook" };
  },
};
