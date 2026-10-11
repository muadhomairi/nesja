/**
 * Lead service. Select the adapter with LEAD_ADAPTER:
 *   mock (default, development) | nesja | webhook | hubspot
 * ▶ REPLACE "mock" with "nesja" when the NESJA.OS API is available.
 */
import type { LeadAdapter } from "./types";
import { mockLeadAdapter } from "./adapters/mock";
import { nesjaLeadAdapter } from "./adapters/nesja";
import { webhookLeadAdapter } from "./adapters/webhook";
import { hubspotLeadAdapter } from "./adapters/hubspot";

const adapters: Record<string, LeadAdapter> = { mock: mockLeadAdapter, nesja: nesjaLeadAdapter, webhook: webhookLeadAdapter, hubspot: hubspotLeadAdapter };

export function getLeadService(): LeadAdapter {
  const id = process.env.LEAD_ADAPTER || "mock";
  const adapter = adapters[id];
  if (!adapter) throw new Error(`Unknown LEAD_ADAPTER "${id}"`);
  return adapter;
}

export type { Lead, LeadType } from "./types";
