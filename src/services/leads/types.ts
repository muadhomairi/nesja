import type { z } from "zod";
import type { attributionSchema } from "@/lib/validation";

export type LeadType = "demo_request" | "contact_sales" | "subscription";

/**
 * Canonical lead shape. Mirrors what NESJA.OS will ingest as a Lead record,
 * so the website can post straight into NESJA once its API is available.
 */
export interface Lead {
  type: LeadType;
  contact: { name?: string; email: string; company?: string; role?: string; country?: string };
  details: Record<string, string | number | boolean | undefined>;
  attribution?: z.infer<typeof attributionSchema>;
  meta: { userAgent: string; referer: string; submittedAt: string };
}

export interface LeadResult { id: string; adapter: string }

export interface LeadAdapter {
  id: string;
  submit(lead: Lead): Promise<LeadResult>;
}
