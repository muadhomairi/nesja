/**
 * Enquiry categories. Every website enquiry carries one of these so it can
 * flow into NESJA.OS (or an interim CRM) already classified.
 * "NESJA uses NESJA to sell NESJA."
 */
export const enquiryCategories = ["DEMO", "SALES", "PROPOSAL", "ENTERPRISE", "IMPLEMENTATION", "INTEGRATION", "SECURITY", "PARTNERSHIP", "GENERAL"] as const;
export type EnquiryCategory = (typeof enquiryCategories)[number];

/** Options offered on the Contact Sales form (DEMO has its own booking flow). */
export const contactEnquiryTypes: { value: Exclude<EnquiryCategory, "DEMO">; label: string; prompt: string }[] = [
  { value: "SALES", label: "Sales enquiry", prompt: "What would you like to improve across your commercial organisation?" },
  { value: "PROPOSAL", label: "Request a proposal", prompt: "Which edition, how many users and what term are you considering?" },
  { value: "ENTERPRISE", label: "Enterprise deployment", prompt: "Tell us about your organisation, deployment model and timeline." },
  { value: "IMPLEMENTATION", label: "Implementation", prompt: "What would you like to plan for your deployment?" },
  { value: "INTEGRATION", label: "Integration requirements", prompt: "Which systems does your commercial organisation rely on?" },
  { value: "SECURITY", label: "Security information", prompt: "What does your security review require?" },
  { value: "PARTNERSHIP", label: "Partnership", prompt: "Tell us about your organisation and how you'd like to work with NESJA." },
  { value: "GENERAL", label: "General enquiry", prompt: "How can we help?" },
];

/**
 * Maps the `type` / `topic` query parameters used by CTAs across the site to
 * a category, so a visitor arriving from "Request Security Information"
 * lands on the form with Security preselected.
 */
const aliases: Record<string, Exclude<EnquiryCategory, "DEMO">> = {
  sales: "SALES",
  proposal: "PROPOSAL",
  enterprise: "ENTERPRISE",
  implementation: "IMPLEMENTATION",
  integration: "INTEGRATION",
  integrations: "INTEGRATION",
  developers: "INTEGRATION",
  security: "SECURITY",
  partnership: "PARTNERSHIP",
  partners: "PARTNERSHIP",
  general: "GENERAL",
};

export function categoryFromParam(value: string | null | undefined): Exclude<EnquiryCategory, "DEMO"> | null {
  if (!value) return null;
  const v = value.toLowerCase();
  return aliases[v] ?? (contactEnquiryTypes.find((t) => t.value.toLowerCase() === v)?.value ?? null);
}
