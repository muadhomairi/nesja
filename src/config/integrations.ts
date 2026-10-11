/**
 * Integration ecosystem configuration.
 * Logos are NOT displayed for third parties unless `logoApproved` is true and
 * a licensed asset path is supplied. Names are shown as plain text categories.
 */
/**
 * status — keep truthful:
 *  - "available"    → a supported, ready-made connector exists today.
 *  - "configurable" → supported through standard configuration (e.g. import, webhooks).
 *  - "custom"       → delivered as a scoped custom integration for a deployment.
 *  - "roadmap"      → not available yet.
 */
export type IntegrationStatus = "available" | "configurable" | "custom" | "roadmap";

export interface Integration {
  id: string;
  name: string;
  category: "Productivity" | "Communication" | "ERP & Finance" | "Contact Centre" | "Payments" | "Analytics";
  description: string;
  status: IntegrationStatus;
  logo?: string;
  logoApproved?: boolean;
}

export const integrations: Integration[] = [
  { id: "m365", name: "Microsoft 365", category: "Productivity", description: "Calendar, contacts and documents.", status: "roadmap" },
  { id: "outlook", name: "Outlook", category: "Productivity", description: "Email capture and logging.", status: "roadmap" },
  { id: "teams", name: "Microsoft Teams", category: "Communication", description: "Meetings and collaboration.", status: "roadmap" },
  { id: "gws", name: "Google Workspace", category: "Productivity", description: "Gmail, Calendar and Drive.", status: "roadmap" },
  { id: "whatsapp", name: "WhatsApp Business", category: "Communication", description: "Business messaging.", status: "roadmap" },
  { id: "odoo", name: "Odoo", category: "ERP & Finance", description: "Orders, invoicing and products.", status: "roadmap" },
  { id: "sap", name: "SAP", category: "ERP & Finance", description: "ERP, finance and master data.", status: "roadmap" },
  { id: "oracle", name: "Oracle", category: "ERP & Finance", description: "ERP and finance.", status: "roadmap" },
  { id: "genesys", name: "Genesys", category: "Contact Centre", description: "Contact-centre interactions.", status: "roadmap" },
  { id: "telephony", name: "Telephony platforms", category: "Contact Centre", description: "Call logging and click-to-call.", status: "roadmap" },
  { id: "payments", name: "Payment providers", category: "Payments", description: "Payment status and billing events.", status: "roadmap" },
  { id: "bi", name: "BI platforms", category: "Analytics", description: "Export to your BI and data warehouse.", status: "roadmap" },
];

export const integrationStatusLabel: Record<IntegrationStatus, string> = { available: "Available", configurable: "Configurable", custom: "Custom integration", roadmap: "Roadmap" };

export const integrationStatusHelp: Record<IntegrationStatus, string> = {
  available: "A supported connector, ready to enable.",
  configurable: "Supported through standard configuration.",
  custom: "Delivered as a scoped integration for your deployment.",
  roadmap: "On the NESJA roadmap. Not yet available.",
};
