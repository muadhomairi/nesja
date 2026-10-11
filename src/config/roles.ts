/** Solutions-by-role content. Each entry renders /solutions/[slug]. */
export interface RoleSolution {
  slug: string;
  role: string;
  headline: string;
  intro: string;
  challenges: string[];
  howNesjaHelps: { title: string; body: string }[];
  modules: string[];
}

export const roles: RoleSolution[] = [
  {
    slug: "ceo",
    role: "CEO",
    headline: "One view of commercial performance.",
    intro: "See how demand, pipeline, pricing, contracts and retention combine into growth, without waiting for someone to assemble the numbers.",
    challenges: ["Performance data arrives late and from different sources", "Forecasts change depending on who prepared them", "Commercial risk is visible only after it has cost revenue"],
    howNesjaHelps: [
      { title: "A single commercial picture", body: "Pipeline, bookings, contract value and renewals measured from one connected data model." },
      { title: "Forecasts with history", body: "See how the forecast was built, who changed it and why." },
      { title: "Early warning", body: "NESJA AI surfaces stalled deals, margin pressure and retention risk while there is still time to act." },
    ],
    modules: ["intelligence", "ai", "pipeline", "success"],
  },
  {
    slug: "chief-commercial-officer",
    role: "Chief Commercial Officer",
    headline: "Control the complete commercial engine.",
    intro: "Run marketing, sales, pricing, contracting and customer success as one engine with shared process, data and accountability.",
    challenges: ["Each commercial function runs its own system", "Handoffs between teams lose context and time", "Pricing and commercial policy are applied inconsistently"],
    howNesjaHelps: [
      { title: "One commercial process", body: "Model your end-to-end process once and govern it across every team and region." },
      { title: "Governed pricing", body: "Price books, discount thresholds and approvals apply automatically in every quote." },
      { title: "Accountability by design", body: "Every stage, approval and commitment has a clear owner." },
    ],
    modules: ["pipeline", "quote", "contracts", "intelligence"],
  },
  {
    slug: "sales-leader",
    role: "Sales Leader",
    headline: "Pipeline, forecasting and execution.",
    intro: "Know exactly where every deal stands, coach on the ones that matter and call the number with confidence.",
    challenges: ["Pipeline reviews depend on manual updates", "Deals stall without anyone noticing", "Quoting delays slow down the close"],
    howNesjaHelps: [
      { title: "Live pipeline", body: "Stage, value and next step on every opportunity, updated by the work itself." },
      { title: "Risk detection", body: "AI flags the deals that need attention so reviews focus on what matters." },
      { title: "Faster quotes", body: "Reps configure accurate quotes inside the opportunity, within policy." },
    ],
    modules: ["pipeline", "quote", "ai", "intelligence"],
  },
  {
    slug: "sales-operations",
    role: "Sales Operations",
    headline: "Govern process, pricing and performance.",
    intro: "Design the commercial process once, enforce it everywhere and measure it without stitching systems together.",
    challenges: ["Process lives in documents nobody follows", "Price lists and discount rules sit in spreadsheets", "Reporting requires reconciling several tools"],
    howNesjaHelps: [
      { title: "Configurable process", body: "Stages, required fields, approvals and automation configured without custom code." },
      { title: "Central price books", body: "One governed catalogue and price book structure by region, currency and channel." },
      { title: "Trustworthy data", body: "Validation and duplicate controls keep reporting accurate." },
    ],
    modules: ["pipeline", "quote", "intelligence", "accounts"],
  },
  {
    slug: "marketing",
    role: "Marketing",
    headline: "Move demand seamlessly into commercial execution.",
    intro: "Hand qualified demand to sales with full context, and see which programmes actually create pipeline and revenue.",
    challenges: ["Leads disappear after handoff", "Attribution stops at the form fill", "Sales and marketing disagree on what qualified means"],
    howNesjaHelps: [
      { title: "Clean lead handoff", body: "Leads arrive with source, campaign and engagement context, routed to the right owner." },
      { title: "Shared qualification", body: "One agreed definition of a qualified lead, applied consistently." },
      { title: "Closed-loop attribution", body: "Follow campaigns through to opportunities, contracts and revenue." },
    ],
    modules: ["pipeline", "engage", "intelligence", "accounts"],
  },
  {
    slug: "finance",
    role: "Finance",
    headline: "Understand commercial commitments before they become revenue.",
    intro: "See contracted value, discounts, billing milestones and renewals as they are agreed, not when they reach the ledger.",
    challenges: ["Discounts are approved outside any controlled process", "Contract commitments are hard to find", "Revenue forecasts don't match the pipeline"],
    howNesjaHelps: [
      { title: "Approval control", body: "Discounts and non-standard terms route to finance automatically above set thresholds." },
      { title: "Commitment visibility", body: "Contract values, payment milestones and obligations in one place." },
      { title: "Forecast alignment", body: "Bookings and renewal forecasts built from the same data sales uses." },
    ],
    modules: ["quote", "contracts", "intelligence"],
  },
  {
    slug: "customer-success",
    role: "Customer Success",
    headline: "See everything promised before the contract was signed.",
    intro: "Start every customer relationship with the full commercial context, then manage health, renewal and expansion in the same system.",
    challenges: ["Handoffs from sales arrive incomplete", "Promises made during the sale are invisible", "Churn risk is discovered at renewal"],
    howNesjaHelps: [
      { title: "Complete handoff", body: "Stakeholders, success criteria and contractual commitments transfer with the account." },
      { title: "Health you can act on", body: "Health signals combine engagement, commercial events and service inputs." },
      { title: "Expansion into pipeline", body: "Growth opportunities flow straight back to sales with context." },
    ],
    modules: ["success", "contracts", "accounts", "engage"],
  },
];

export const getRole = (slug: string) => roles.find((r) => r.slug === slug);
