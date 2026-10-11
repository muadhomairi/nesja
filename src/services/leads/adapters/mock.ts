/**
 * DEVELOPMENT ADAPTER — replace in production by setting LEAD_ADAPTER to
 * "nesja", "webhook" or "hubspot". Stores leads in memory and, outside
 * production, appends them to .data/leads.ndjson so the full UX can be tested.
 * In production (no adapter configured yet) the complete lead is written to
 * the server log as one JSON line, so no submission is silently discarded.
 */
import { randomUUID } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { Lead, LeadAdapter } from "../types";

export const memoryLeads: (Lead & { id: string })[] = [];

export const mockLeadAdapter: LeadAdapter = {
  id: "mock",
  async submit(lead) {
    const id = `lead_${randomUUID()}`;
    memoryLeads.push({ ...lead, id });
    console.info(`[leads:mock] ${lead.type}${lead.category ? `/${lead.category}` : ""} from ${lead.contact.email} (${id})`);
    if (process.env.NODE_ENV === "production") console.info(`[leads:unrouted] ${JSON.stringify({ id, ...lead })}`);
    if (process.env.NODE_ENV !== "production") {
      try {
        const dir = path.join(process.cwd(), ".data");
        await mkdir(dir, { recursive: true });
        await appendFile(path.join(dir, "leads.ndjson"), JSON.stringify({ id, ...lead }) + "\n");
      } catch { /* read-only filesystem: memory only */ }
    }
    return { id, adapter: "mock" };
  },
};
