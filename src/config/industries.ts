/**
 * Industry pages. Copy explains how the existing platform applies to each
 * industry. Do not add industry-specific capabilities or compliance claims
 * here unless they exist in the product.
 */
export interface Industry {
  slug: string;
  name: string;
  headline: string;
  intro: string;
  realities: string[];
  applications: { title: string; body: string; modules: string[] }[];
  seoTitle: string;
}

export const industries: Industry[] = [
  {
    slug: "financial-services",
    name: "Financial Services",
    seoTitle: "Commercial Operating System for Financial Services",
    headline: "Commercial discipline for relationship-driven institutions.",
    intro: "Banks, insurers and investment firms manage long relationships, structured offers and approval-heavy processes. NESJA connects them in one governed commercial environment.",
    realities: ["Relationship managers own complex, multi-product client portfolios", "Pricing and terms require documented approvals", "Client information is spread across product lines"],
    applications: [
      { title: "Client relationship view", body: "Corporate and institutional relationships modelled with hierarchy, stakeholders and full history.", modules: ["accounts"] },
      { title: "Approval-driven offers", body: "Pricing exceptions and non-standard terms follow configured approval routes with an audit trail.", modules: ["quote", "contracts"] },
      { title: "Portfolio intelligence", body: "Pipeline, renewals and relationship health measured consistently across product lines.", modules: ["intelligence", "success"] },
    ],
  },
  {
    slug: "telecommunications",
    name: "Telecommunications",
    seoTitle: "Commercial Operating System for Telecommunications",
    headline: "Configure complex enterprise solutions without losing the deal in the detail.",
    intro: "Enterprise telecom sales combine connectivity, devices, services and multi-site rollouts. NESJA handles the bundles, quantities and commitments in one flow.",
    realities: ["Enterprise offers bundle many products across many sites", "Quotes are long, detailed and frequently revised", "Contract commitments drive delivery and billing"],
    applications: [
      { title: "Bundle and BOQ configuration", body: "Configure multi-line, multi-site solutions with rules that prevent invalid combinations.", modules: ["quote"] },
      { title: "Commitment tracking", body: "Contract terms, minimum commitments and milestones visible to delivery and finance.", modules: ["contracts"] },
      { title: "Renewal and expansion", body: "Renewal windows and growth opportunities managed against the full account picture.", modules: ["success", "pipeline"] },
    ],
  },
  {
    slug: "healthcare",
    name: "Healthcare",
    seoTitle: "Commercial Operating System for Healthcare Suppliers",
    headline: "Structured commercial operations for healthcare suppliers and providers.",
    intro: "Healthcare suppliers sell to institutions with formal procurement, many stakeholders and long contract lives. NESJA keeps every thread of that relationship together.",
    realities: ["Procurement involves clinical, administrative and finance stakeholders", "Tenders and framework agreements shape pricing", "Service obligations continue long after signature"],
    applications: [
      { title: "Stakeholder mapping", body: "Track every decision maker and influencer across departments and sites.", modules: ["accounts"] },
      { title: "Tender-ready quotations", body: "Structured BOQ quotations aligned with institutional price books.", modules: ["quote"] },
      { title: "Obligation management", body: "Service commitments and contract milestones tracked with clear owners.", modules: ["contracts", "success"] },
    ],
  },
  {
    slug: "government",
    name: "Government",
    seoTitle: "Commercial Operating System for Government Suppliers",
    headline: "Disciplined commercial management for public-sector engagements.",
    intro: "Selling to and operating with government entities demands process discipline, documented approvals and visibility of long-term commitments.",
    realities: ["Formal procurement cycles with defined stages", "Strict approval and documentation requirements", "Multi-year agreements with defined obligations"],
    applications: [
      { title: "Governed process", body: "Stage criteria and approvals that mirror formal procurement steps.", modules: ["pipeline", "quote"] },
      { title: "Audit-ready history", body: "Every change, approval and communication recorded against the record.", modules: ["accounts", "engage"] },
      { title: "Long-term commitments", body: "Multi-year contract obligations and milestones visible to every team.", modules: ["contracts"] },
    ],
  },
  {
    slug: "utilities",
    name: "Utilities",
    seoTitle: "Commercial Operating System for Utilities",
    headline: "Manage large commercial accounts with the same rigour as the network.",
    intro: "Utilities manage high-value commercial and industrial customers, long agreements and complex service relationships. NESJA gives those teams one commercial view.",
    realities: ["Key accounts span many sites and contracts", "Agreements run for years with defined terms", "Commercial teams need context from operations"],
    applications: [
      { title: "Key account management", body: "Hierarchies, sites and stakeholders for large commercial customers.", modules: ["accounts"] },
      { title: "Agreement lifecycle", body: "Terms, renewals and amendments managed from one record.", modules: ["contracts"] },
      { title: "Commercial reporting", body: "Pipeline, contracted value and renewals reported together.", modules: ["intelligence"] },
    ],
  },
  {
    slug: "technology",
    name: "Technology",
    seoTitle: "Commercial Operating System for Technology Companies",
    headline: "From product-led signals to enterprise contracts.",
    intro: "Technology companies sell subscriptions, services and solutions through several motions at once. NESJA connects them from first signal to renewal.",
    realities: ["Several sales motions run in parallel", "Pricing combines licences, services and usage", "Retention and expansion drive growth"],
    applications: [
      { title: "Multi-motion pipeline", body: "Inbound, outbound, partner and expansion pipeline in one governed view.", modules: ["pipeline"] },
      { title: "Subscription quoting", body: "Licences, services and options configured within pricing policy.", modules: ["quote"] },
      { title: "Net retention focus", body: "Health, renewal and expansion managed as one process.", modules: ["success", "intelligence"] },
    ],
  },
  {
    slug: "professional-services",
    name: "Professional Services",
    seoTitle: "Commercial Operating System for Professional Services",
    headline: "Win, scope and deliver engagements on one commercial record.",
    intro: "Consultancies and service firms sell expertise through proposals, statements of work and long client relationships. NESJA keeps scoping, pricing and commitments connected.",
    realities: ["Proposals combine people, phases and expenses", "Scope agreed in the sale defines delivery", "Client relationships span many engagements"],
    applications: [
      { title: "Structured proposals", body: "Phase-based quotations with roles, rates and options.", modules: ["quote"] },
      { title: "Scope continuity", body: "What was sold, and the terms agreed, are visible to delivery leads.", modules: ["contracts", "success"] },
      { title: "Client portfolio view", body: "All engagements and opportunities for a client in one place.", modules: ["accounts", "intelligence"] },
    ],
  },
  {
    slug: "retail",
    name: "Retail",
    seoTitle: "Commercial Operating System for Retail B2B Teams",
    headline: "Commercial control for B2B and wholesale retail teams.",
    intro: "Retail organisations increasingly sell to businesses, franchisees and partners. NESJA brings structure to those B2B commercial relationships.",
    realities: ["B2B, wholesale and franchise relationships run alongside consumer business", "Price lists vary by customer and volume", "Agreements define ranges, volumes and terms"],
    applications: [
      { title: "Customer-specific pricing", body: "Price books and discount rules by customer group, region or channel.", modules: ["quote"] },
      { title: "Partner agreements", body: "Terms and commitments for wholesale and franchise partners.", modules: ["contracts"] },
      { title: "Account growth", body: "Track performance and growth opportunities by B2B account.", modules: ["accounts", "intelligence"] },
    ],
  },
  {
    slug: "travel-hospitality",
    name: "Travel & Hospitality",
    seoTitle: "Commercial Operating System for Travel & Hospitality",
    headline: "Corporate, group and partner sales on one commercial platform.",
    intro: "Hotels, travel companies and hospitality groups manage corporate accounts, group business and partner agreements. NESJA connects those commercial threads.",
    realities: ["Corporate and group sales involve negotiated rates and packages", "Partner and agency agreements carry specific terms", "Relationships span properties and regions"],
    applications: [
      { title: "Packages and negotiated rates", body: "Configure packages and customer-specific rates within commercial policy.", modules: ["quote"] },
      { title: "Corporate account management", body: "Multi-property, multi-region relationships with full history.", modules: ["accounts"] },
      { title: "Agreement tracking", body: "Corporate and partner agreements with renewal visibility.", modules: ["contracts", "success"] },
    ],
  },
];

export const getIndustry = (slug: string) => industries.find((i) => i.slug === slug);
