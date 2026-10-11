/** The interactive product journey (homepage + platform page). */
export type JourneyView = "lead" | "opportunity" | "pipeline" | "bundle" | "quote" | "approval" | "contract" | "comms" | "active" | "success" | "dashboard" | "ai";

export interface JourneyStep {
  id: JourneyView;
  title: string;
  module: string;
  body: string;
}

export const journeySteps: JourneyStep[] = [
  { id: "lead", title: "Lead enters NESJA", module: "pipeline", body: "A demo request arrives with its source, campaign and company already attached, and is routed to the right owner." },
  { id: "opportunity", title: "Lead becomes an opportunity", module: "pipeline", body: "Qualified in one click. Contacts, context and history carry over automatically." },
  { id: "pipeline", title: "Opportunity moves through pipeline", module: "pipeline", body: "Stages, criteria and next steps keep the deal moving and visible to leadership." },
  { id: "bundle", title: "Solution bundle is configured", module: "quote", body: "Products, services and options are combined with rules that prevent invalid configurations." },
  { id: "quote", title: "Quote is generated", module: "quote", body: "Pricing, discounts and terms are applied from governed price books and produced as a branded quotation." },
  { id: "approval", title: "Approval workflow starts", module: "quote", body: "A discount above policy routes automatically to the right approver, with the margin impact shown." },
  { id: "contract", title: "Contract is produced", module: "contracts", body: "The accepted quote becomes a contract with obligations, milestones and renewal dates." },
  { id: "comms", title: "Communications are tracked", module: "engage", body: "Every email and meeting stays attached to the opportunity and the account." },
  { id: "active", title: "Customer becomes active", module: "accounts", body: "The account record now holds the full commercial story, from first touch to signature." },
  { id: "success", title: "Customer Success takes ownership", module: "success", body: "Commitments, stakeholders and success criteria hand over with nothing lost." },
  { id: "dashboard", title: "Management dashboards update", module: "intelligence", body: "Bookings, pipeline and contracted value update in real time from the same data." },
  { id: "ai", title: "AI identifies risks and actions", module: "ai", body: "NESJA AI flags risks across the lifecycle and recommends the next best action." },
];
