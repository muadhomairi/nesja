/**
 * Product-module configuration. The system map, navigation, footer, module
 * pages, sitemap and journey all read from this list, so adding a module here
 * adds it everywhere. Shape is CMS-ready (plain serialisable data).
 */
export type CapabilityStatus = "available" | "roadmap";

export interface ModuleCapability {
  title: string;
  body: string;
  /** "roadmap" capabilities render with a clear "On the roadmap" label. */
  status?: CapabilityStatus;
}

export interface ProductModule {
  slug: string;
  name: string;
  label: string;
  summary: string;
  headline: string;
  intro: string;
  icon: IconName;
  accent: "teal" | "signal";
  outcomes: string[];
  capabilities: ModuleCapability[];
  connectsTo: string[];
  seoKeywords: string[];
}

export type IconName =
  | "pipeline" | "accounts" | "quote" | "contracts" | "engage" | "success" | "intelligence" | "ai"
  | "marketing" | "core";

export const modules: ProductModule[] = [
  {
    slug: "pipeline",
    name: "NESJA Pipeline",
    label: "Pipeline",
    summary: "Lead and opportunity management",
    headline: "Every signal becomes an opportunity you can see, own and move.",
    intro:
      "NESJA Pipeline captures demand from every source, qualifies it consistently and carries each opportunity through a governed sales process. Your team works one pipeline, and leadership reads the same one.",
    icon: "pipeline",
    accent: "teal",
    outcomes: ["One pipeline across every team and region", "Clear ownership at every stage", "Fewer opportunities lost between handoffs"],
    capabilities: [
      { title: "Lead capture and routing", body: "Bring in leads from web forms, campaigns, imports and partners, then route them by territory, segment or capacity." },
      { title: "Qualification frameworks", body: "Apply the qualification model your organisation uses, with required fields at the stages where they matter." },
      { title: "Configurable sales stages", body: "Model your commercial process with entry and exit criteria, probabilities and stage-specific actions." },
      { title: "Activity and follow-up", body: "Tasks, meetings and next steps live on the opportunity, so nothing depends on someone's inbox." },
      { title: "Pipeline views", body: "Board, list and forecast views of the same data, filtered by owner, team, product or period." },
      { title: "Handoff to quoting", body: "When an opportunity is ready, the solution moves straight into NESJA Quote with its context intact." },
    ],
    connectsTo: ["accounts", "quote", "intelligence", "ai"],
    seoKeywords: ["sales pipeline management", "opportunity management software", "lead management"],
  },
  {
    slug: "accounts",
    name: "NESJA Accounts",
    label: "Accounts",
    summary: "360° customer and account intelligence",
    headline: "The whole relationship, on one page.",
    intro:
      "NESJA Accounts brings contacts, opportunities, quotes, contracts, conversations and service health together around each customer. Anyone who touches the account understands it in minutes.",
    icon: "accounts",
    accent: "signal",
    outcomes: ["A single source of truth for every customer", "Faster onboarding for new account owners", "Relationship context available before every meeting"],
    capabilities: [
      { title: "Account hierarchy", body: "Model parent companies, subsidiaries, sites and buying centres the way your customers are actually structured." },
      { title: "Contacts and stakeholders", body: "Map decision makers, influencers and champions with roles and relationship strength." },
      { title: "Unified timeline", body: "Every email, call, meeting, quote and contract milestone in one chronological view." },
      { title: "Commercial position", body: "Active contracts, open opportunities, renewals and commitments summarised at a glance." },
      { title: "Account plans", body: "Shared objectives, whitespace and growth plays tracked against real activity." },
      { title: "Data quality", body: "Duplicate detection and required-field governance keep the account record trustworthy." },
    ],
    connectsTo: ["pipeline", "engage", "success", "intelligence"],
    seoKeywords: ["account management software", "customer 360", "key account management"],
  },
  {
    slug: "quote",
    name: "NESJA Quote",
    label: "Quote",
    summary: "CPQ, BOQ, pricing and bundle configuration",
    headline: "Configure complex offers. Quote with confidence.",
    intro:
      "NESJA Quote turns your catalogue, price books and commercial rules into accurate quotations. It handles simple product quotes and complex bills of quantity with bundles, options and approval thresholds.",
    icon: "quote",
    accent: "teal",
    outcomes: ["Quotes produced in minutes, not days", "Pricing and discount policy applied consistently", "Margin visible before a proposal leaves the building"],
    capabilities: [
      { title: "Product catalogue and price books", body: "Products, services, units and price books by region, currency, segment or channel." },
      { title: "Bundle configuration", body: "Build solution bundles with dependencies, options and rules that prevent invalid combinations." },
      { title: "Bill of quantities (BOQ)", body: "Structure large, multi-line quotations by section, site or phase with quantities and unit rates." },
      { title: "Discount governance", body: "Approval workflows trigger automatically when discounts or terms exceed policy." },
      { title: "Branded documents", body: "Generate consistent, on-brand quotation documents from approved templates." },
      { title: "Quote to contract", body: "Accepted quotes flow directly into NESJA Contracts without re-keying a single line." },
    ],
    connectsTo: ["pipeline", "contracts", "intelligence", "ai"],
    seoKeywords: ["CPQ software", "configure price quote", "BOQ software", "quotation software"],
  },
  {
    slug: "contracts",
    name: "NESJA Contracts",
    label: "Contracts",
    summary: "Contract lifecycle, commitments and obligations",
    headline: "Know what you've promised, and when it's due.",
    intro:
      "NESJA Contracts manages agreements from draft to renewal. Because contracts come from approved quotes, the commitments your team made are visible to delivery, finance and customer success.",
    icon: "contracts",
    accent: "signal",
    outcomes: ["Commitments visible across the organisation", "No surprise renewals or expiries", "A clear trail from quote to signed agreement"],
    capabilities: [
      { title: "Contract generation", body: "Produce agreements from templates and clause libraries, pre-filled from the accepted quote." },
      { title: "Review and approval", body: "Route contracts through legal, finance and commercial approvals with full version history." },
      { title: "Obligations and milestones", body: "Track deliverables, service levels and payment milestones with owners and due dates." },
      { title: "Renewals and expiries", body: "Renewal windows surface early enough to act, with the account context attached." },
      { title: "Amendments", body: "Changes and variations stay linked to the original agreement and its commercial value." },
      { title: "E-signature ready", body: "Designed to connect to your preferred electronic signature provider.", status: "roadmap" },
    ],
    connectsTo: ["quote", "success", "accounts", "intelligence"],
    seoKeywords: ["contract management software", "contract lifecycle management", "CLM"],
  },
  {
    slug: "engage",
    name: "NESJA Engage",
    label: "Engage",
    summary: "Commercial communications",
    headline: "Every commercial conversation, connected to the work.",
    intro:
      "NESJA Engage keeps communication attached to the account, opportunity or contract it belongs to. Email is where it starts. Omnichannel engagement across WhatsApp, SMS, voice and social is on the roadmap.",
    icon: "engage",
    accent: "teal",
    outcomes: ["Conversations visible to everyone who needs them", "Consistent, compliant messaging", "Follow-ups that happen on time"],
    capabilities: [
      { title: "Email", body: "Send, receive and log commercial email against the right record, with templates and tracking." },
      { title: "Sequences and follow-ups", body: "Structured follow-up cadences so prospects and customers hear from you at the right moment." },
      { title: "Shared conversation history", body: "The full thread stays with the account, even when owners change." },
      { title: "WhatsApp", body: "Business messaging connected to the commercial record.", status: "roadmap" },
      { title: "SMS and voice", body: "Text and call activity captured where your team already works.", status: "roadmap" },
      { title: "Social channels", body: "Social engagement brought into the same commercial view.", status: "roadmap" },
    ],
    connectsTo: ["accounts", "pipeline", "success", "ai"],
    seoKeywords: ["sales engagement platform", "commercial communications", "omnichannel engagement"],
  },
  {
    slug: "success",
    name: "NESJA Success",
    label: "Success",
    summary: "Customer success, retention and growth",
    headline: "See everything promised before the contract was signed.",
    intro:
      "NESJA Success hands customer success teams the full commercial story: what was sold, what was promised and what matters to the customer. Retention and expansion become managed processes, not reactions.",
    icon: "success",
    accent: "signal",
    outcomes: ["Clean handoff from sales to success", "Earlier visibility of churn risk", "Expansion opportunities flowing back to pipeline"],
    capabilities: [
      { title: "Sales-to-success handoff", body: "Commitments, stakeholders and success criteria transfer automatically when a contract goes live." },
      { title: "Onboarding plans", body: "Structured onboarding milestones with owners on both sides." },
      { title: "Customer health", body: "Health indicators combine engagement, adoption inputs, service signals and commercial events." },
      { title: "Renewal management", body: "Renewal forecasts and plays that start well before the date." },
      { title: "Expansion", body: "Upsell and cross-sell opportunities created directly into NESJA Pipeline." },
      { title: "Success reviews", body: "Prepare business reviews from live data instead of assembled slides." },
    ],
    connectsTo: ["contracts", "accounts", "pipeline", "intelligence"],
    seoKeywords: ["customer success platform", "customer retention software", "renewal management"],
  },
  {
    slug: "intelligence",
    name: "NESJA Intelligence",
    label: "Intelligence",
    summary: "Dashboards, forecasting and management intelligence",
    headline: "One version of commercial performance.",
    intro:
      "NESJA Intelligence reports on the whole commercial lifecycle from one data model. Pipeline, quoting, contracts and retention are measured together, so leadership decisions rest on the same facts.",
    icon: "intelligence",
    accent: "teal",
    outcomes: ["Forecasts leadership can trust", "No more reconciling reports from different systems", "Performance visible from team to board level"],
    capabilities: [
      { title: "Executive dashboards", body: "Revenue, pipeline, bookings, renewals and margin in a single executive view." },
      { title: "Forecasting", body: "Roll-up forecasts by team, region and product with submission and override history." },
      { title: "Funnel and conversion", body: "Measure conversion and velocity from first touch to signed contract." },
      { title: "Quote and pricing analytics", body: "Discount patterns, win rates by price point and approval cycle times." },
      { title: "Team performance", body: "Activity, attainment and coaching insight for every commercial role." },
      { title: "Data export", body: "Connect your BI platform when you need analysis beyond NESJA." },
    ],
    connectsTo: ["pipeline", "quote", "success", "ai"],
    seoKeywords: ["sales forecasting software", "commercial intelligence", "revenue dashboards"],
  },
  {
    slug: "ai",
    name: "NESJA AI",
    label: "AI",
    summary: "Embedded AI and commercial automation",
    headline: "Intelligence woven into every commercial motion.",
    intro:
      "NESJA AI works across the commercial lifecycle rather than inside a standalone assistant. It reads the same connected data your teams use and brings risks, summaries and recommended actions into the screens where work already happens.",
    icon: "ai",
    accent: "signal",
    outcomes: ["Risks surfaced before they become losses", "Less time preparing, more time selling", "Consistent recommendations grounded in your data"],
    capabilities: [
      { title: "Pipeline risk detection", body: "Flags opportunities that are stalling, under-engaged or drifting from your process." },
      { title: "Next-best action", body: "Suggests the most useful next step on each opportunity and account." },
      { title: "Account summaries and meeting prep", body: "Concise briefings built from the full account record before every conversation." },
      { title: "Quotation and proposal assistance", body: "Helps assemble bundles, check pricing policy and draft proposal content." },
      { title: "Contract insights", body: "Highlights obligations, renewal terms and unusual clauses." },
      { title: "Forecasting and anomaly detection", body: "Spots unusual movements in pipeline, pricing and customer health." },
    ],
    connectsTo: ["pipeline", "accounts", "quote", "intelligence"],
    seoKeywords: ["AI sales platform", "AI for sales teams", "sales automation"],
  },
];

export const getModule = (slug: string) => modules.find((m) => m.slug === slug);
