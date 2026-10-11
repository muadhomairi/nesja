/**
 * Integration ecosystem configuration.
 * Logos are NOT displayed for third parties unless `logoApproved` is true and
 * a licensed asset path is supplied. Names are shown as plain text categories.
 */
export type IntegrationStatus = "available" | "beta" | "planned";

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
  { id: "m365", name: "Microsoft 365", category: "Productivity", description: "Calendar, contacts and documents.", status: "planned" },
  { id: "outlook", name: "Outlook", category: "Productivity", description: "Email capture and logging.", status: "planned" },
  { id: "teams", name: "Microsoft Teams", category: "Communication", description: "Meetings and collaboration.", status: "planned" },
  { id: "gws", name: "Google Workspace", category: "Productivity", description: "Gmail, Calendar and Drive.", status: "planned" },
  { id: "whatsapp", name: "WhatsApp Business", category: "Communication", description: "Business messaging.", status: "planned" },
  { id: "odoo", name: "Odoo", category: "ERP & Finance", description: "Orders, invoicing and products.", status: "planned" },
  { id: "sap", name: "SAP", category: "ERP & Finance", description: "ERP, finance and master data.", status: "planned" },
  { id: "oracle", name: "Oracle", category: "ERP & Finance", description: "ERP and finance.", status: "planned" },
  { id: "genesys", name: "Genesys", category: "Contact Centre", description: "Contact-centre interactions.", status: "planned" },
  { id: "telephony", name: "Telephony platforms", category: "Contact Centre", description: "Call logging and click-to-call.", status: "planned" },
  { id: "payments", name: "Payment providers", category: "Payments", description: "Payment status and billing events.", status: "planned" },
  { id: "bi", name: "BI platforms", category: "Analytics", description: "Export to your BI and data warehouse.", status: "planned" },
];

export const integrationStatusLabel: Record<IntegrationStatus, string> = { available: "Available", beta: "Beta", planned: "Planned" };
