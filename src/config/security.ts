/**
 * Trust & security configuration.
 *
 * status:
 *  - "achieved"    → shown as achieved. ONLY set after the certificate/report exists.
 *  - "in-progress" → shown as "In progress" (an audit is actually underway).
 *  - "planned"     → shown as "Planned".
 *  - "hidden"      → not rendered.
 * Never mark anything achieved without evidence. Defaults are conservative.
 */
export type TrustStatus = "achieved" | "in-progress" | "planned" | "hidden";

export interface TrustItem {
  id: string;
  name: string;
  description: string;
  status: TrustStatus;
  evidenceUrl?: string;
}

export const certifications: TrustItem[] = [
  { id: "iso27001", name: "ISO/IEC 27001", description: "Information security management system certification.", status: "planned" },
  { id: "soc2", name: "SOC 2 Type II", description: "Independent attestation of security, availability and confidentiality controls.", status: "planned" },
  { id: "gdpr", name: "GDPR alignment", description: "Data-protection practices aligned with the EU General Data Protection Regulation.", status: "planned" },
];

export const controls: TrustItem[] = [
  { id: "encryption", name: "Encryption", description: "Encryption of customer data in transit and at rest.", status: "planned" },
  { id: "sso", name: "Single sign-on (SSO)", description: "Sign in through your corporate identity provider.", status: "planned" },
  { id: "mfa", name: "Multi-factor authentication", description: "A second factor for every user sign-in.", status: "planned" },
  { id: "rbac", name: "Role-based access control", description: "Permissions scoped by role, team and record.", status: "planned" },
  { id: "audit", name: "Audit trails", description: "A record of who changed what, and when.", status: "planned" },
  { id: "backups", name: "Backups", description: "Regular, tested backups of customer data.", status: "planned" },
  { id: "dr", name: "Disaster recovery", description: "Documented recovery objectives and procedures.", status: "planned" },
  { id: "residency", name: "Data residency", description: "Choice of hosting region for customer data.", status: "planned" },
  { id: "sovereign", name: "Sovereign hosting", description: "Deployment within national or sovereign cloud environments for regulated organisations.", status: "planned" },
];

export const securityPrinciples = [
  { title: "Your data is yours", body: "Customer data belongs to the customer. We process it to deliver NESJA, and nothing else." },
  { title: "Least privilege", body: "Access to customer environments is restricted, justified and reviewed." },
  { title: "Transparency over claims", body: "We publish the status of every certification and control, including those on our roadmap." },
  { title: "Built for regulated industries", body: "Our architecture is designed for dedicated, private and sovereign deployment models." },
];

export const statusLabel: Record<TrustStatus, string> = { achieved: "Achieved", "in-progress": "In progress", planned: "Planned", hidden: "" };
export const visible = (items: TrustItem[]) => items.filter((i) => i.status !== "hidden");
