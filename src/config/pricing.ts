/**
 * ============================================================================
 * CENTRAL PRICING CONFIGURATION — the only place commercial values live.
 * ============================================================================
 * Every number the pricing page, calculator, comparison table and structured
 * data show is derived from this file via src/lib/pricing/calculate.ts.
 * UI components must never hard-code prices, discounts or savings.
 *
 * Values are published on the live site. Essential uses the ladder from the
 * original brief ($99 / $84 / $74 / $64). Professional values follow the same
 * discount ladder and are awaiting confirmation by NESJA commercial
 * leadership — confirm or correct them here.
 */
import type { CurrencyCode } from "./locales";

export type TermId = "monthly" | "12m" | "24m" | "36m";
export type EditionId = "essential" | "professional" | "enterprise";
export type BillingFrequency = "monthly" | "annual" | "upfront";

export interface ContractTerm {
  id: TermId;
  label: string;
  shortLabel: string;
  months: number;
  /** Plain-language commitment statement shown next to every price for this term. */
  commitment: string;
  /** Billing frequency options. The first is the default that pricing assumes. */
  billing: BillingFrequency[];
  highlight?: "most-popular";
}

export interface VolumeTier {
  /** Inclusive seat threshold at which this discount starts applying. */
  minSeats: number;
  /** Additional fractional discount (0.05 = 5%) applied on top of the term price. */
  discount: number;
}

export interface Edition {
  id: EditionId;
  name: string;
  tagline: string;
  description: string;
  /** null = custom pricing (Talk to Sales). Keys: currency → term → price per user per month. */
  priceBook: Partial<Record<CurrencyCode, Record<TermId, number>>> | null;
  includedModules: string[];
  highlights: string[];
  suitableFor?: string[];
  cta: "book-demo" | "talk-to-sales" | "start-trial";
  minSeats: number;
  maxSelfServeSeats?: number;
  recommended?: boolean;
}

export type AddOnModel = "per-user" | "flat-monthly" | "usage" | "one-off" | "quoted";

export interface AddOn {
  id: string;
  name: string;
  description: string;
  model: AddOnModel;
  /** Leave null while pricing is quoted. Shown as "Priced on request". */
  price: number | null;
  unit?: string;
  status: "available" | "planned";
  category: "module" | "integration" | "implementation" | "communication" | "ai";
}

export const pricingConfig = {
  defaultCurrency: "USD" as CurrencyCode,
  defaultEdition: "essential" as EditionId,
  defaultTerm: "monthly" as TermId, // Never pre-select a long-term commitment.
  defaultSeats: 50,
  /** Seat counts offered as quick presets in the calculator. */
  seatPresets: [10, 25, 50, 100, 250, 500, 1000, 5000] as number[],
  /** At or above this, the calculator recommends a tailored Enterprise agreement. */
  enterpriseSeatThreshold: 10000,
  minSeats: 1,
  /** Shown as "Save X%" — floored so displayed savings are never overstated. */
  savingsRounding: "floor" as const,
  /**
   * Volume tiers apply on top of term pricing. Empty = no volume discounts yet.
   * Example: [{ minSeats: 500, discount: 0.05 }, { minSeats: 1000, discount: 0.1 }]
   */
  volumeTiers: [] as VolumeTier[],
  /** Publish prices in structured data (schema.org Offer). Keep false until all prices are confirmed. */
  publishStructuredOffers: false,

  terms: [
    { id: "monthly", label: "Monthly", shortLabel: "Monthly", months: 1, commitment: "No long-term commitment. Billed monthly.", billing: ["monthly"] },
    { id: "12m", label: "12 Months", shortLabel: "12 mo", months: 12, commitment: "12-month agreement. Price shown per user, per month.", billing: ["annual", "monthly"] },
    { id: "24m", label: "24 Months", shortLabel: "24 mo", months: 24, commitment: "24-month agreement. Price shown per user, per month.", billing: ["annual", "monthly"], highlight: "most-popular" },
    { id: "36m", label: "36 Months", shortLabel: "36 mo", months: 36, commitment: "36-month agreement. Price shown per user, per month.", billing: ["annual", "monthly"] },
  ] as ContractTerm[],

  editions: [
    {
      id: "essential",
      name: "Essential",
      tagline: "Core commercial execution",
      description: "Pipeline, accounts and activity in one connected system for teams standardising how they sell.",
      priceBook: { USD: { monthly: 99, "12m": 84, "24m": 74, "36m": 64 } },
      includedModules: ["pipeline", "accounts", "engage", "intelligence"],
      highlights: ["Lead, opportunity and pipeline management", "360° accounts and contacts", "Email and activity tracking", "Standard dashboards"],
      cta: "book-demo",
      minSeats: 1,
    },
    {
      id: "professional",
      name: "Professional",
      tagline: "Advanced commercial operations",
      description: "Adds quoting, contracts and customer success so the full commercial lifecycle runs on NESJA.",
      // Awaiting confirmation by NESJA commercial leadership.
      priceBook: { USD: { monthly: 139, "12m": 118, "24m": 104, "36m": 90 } },
      includedModules: ["pipeline", "accounts", "engage", "intelligence", "quote", "contracts", "success", "ai"],
      highlights: ["Everything in Essential", "CPQ, BOQ and bundle configuration", "Contract lifecycle and obligations", "Customer success and renewals", "Forecasting and NESJA AI"],
      cta: "book-demo",
      minSeats: 1,
      recommended: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      tagline: "Organisation-wide Commercial OS",
      description: "For organisations running every commercial motion on NESJA, with dedicated environments and advanced governance.",
      priceBook: null,
      includedModules: ["pipeline", "accounts", "engage", "intelligence", "quote", "contracts", "success", "ai"],
      highlights: ["Everything in Professional", "Dedicated or private-cloud environment", "Advanced integrations and governance", "Enterprise security reviews"],
      suitableFor: ["Large enterprises", "Private cloud", "Sovereign hosting", "Advanced integrations", "Enterprise security", "Dedicated environment", "High-volume communication", "Custom AI deployment"],
      cta: "talk-to-sales",
      minSeats: 1,
    },
  ] as Edition[],

  /** Pricing components beyond the licence: implementation, integrations and consumption. */
  addOns: [
    { id: "implementation", name: "Implementation services", description: "Configuration, data migration and enablement, scoped to your organisation.", model: "quoted", price: null, status: "available", category: "implementation" },
    { id: "integrations", name: "Integration packs", description: "Connections to ERP, finance, identity and communication platforms.", model: "quoted", price: null, status: "planned", category: "integration" },
    { id: "communication", name: "Communication consumption", description: "Usage-based messaging for WhatsApp, SMS and voice channels.", model: "usage", price: null, unit: "message / minute", status: "planned", category: "communication" },
    { id: "ai-usage", name: "AI consumption", description: "Additional AI capacity beyond the allowance included with your edition.", model: "usage", price: null, unit: "AI credit", status: "planned", category: "ai" },
  ] as AddOn[],
};

/** Feature comparison rows. Values: true / false / string (e.g. "Add-on"). */
export const comparisonGroups: { group: string; rows: { feature: string; values: Record<EditionId, boolean | string> }[] }[] = [
  {
    group: "Pipeline & accounts",
    rows: [
      { feature: "Lead and opportunity management", values: { essential: true, professional: true, enterprise: true } },
      { feature: "Configurable sales stages", values: { essential: true, professional: true, enterprise: true } },
      { feature: "Account hierarchies and 360° view", values: { essential: true, professional: true, enterprise: true } },
      { feature: "Territory and routing rules", values: { essential: "Standard", professional: "Advanced", enterprise: "Advanced" } },
    ],
  },
  {
    group: "Quote & contracts",
    rows: [
      { feature: "Product catalogue and price books", values: { essential: "Basic", professional: true, enterprise: true } },
      { feature: "CPQ, BOQ and bundle configuration", values: { essential: false, professional: true, enterprise: true } },
      { feature: "Discount approval workflows", values: { essential: false, professional: true, enterprise: true } },
      { feature: "Contract lifecycle and obligations", values: { essential: false, professional: true, enterprise: true } },
    ],
  },
  {
    group: "Engage & success",
    rows: [
      { feature: "Email and activity tracking", values: { essential: true, professional: true, enterprise: true } },
      { feature: "Customer success and renewals", values: { essential: false, professional: true, enterprise: true } },
      { feature: "Omnichannel (WhatsApp, SMS, voice)", values: { essential: "Roadmap", professional: "Roadmap", enterprise: "Roadmap" } },
    ],
  },
  {
    group: "Intelligence & AI",
    rows: [
      { feature: "Standard dashboards", values: { essential: true, professional: true, enterprise: true } },
      { feature: "Forecasting", values: { essential: false, professional: true, enterprise: true } },
      { feature: "NESJA AI", values: { essential: false, professional: true, enterprise: "Custom deployment" } },
    ],
  },
  {
    group: "Platform & governance",
    rows: [
      { feature: "Role-based access", values: { essential: true, professional: true, enterprise: true } },
      { feature: "Single sign-on (SSO)", values: { essential: false, professional: true, enterprise: true } },
      { feature: "Dedicated / private-cloud environment", values: { essential: false, professional: false, enterprise: true } },
      { feature: "Sovereign hosting options", values: { essential: false, professional: false, enterprise: "On request" } },
    ],
  },
];

export const pricingFaqs = [
  { q: "How does contract length affect price?", a: "Longer agreements carry a lower price per user. Every price on this page states the commitment period it belongs to, and the calculator shows the total contract value before you speak to anyone." },
  { q: "Is the monthly price a commitment?", a: "No. Monthly pricing carries no long-term commitment. Prices for 12, 24 and 36-month terms are shown as a per-user monthly equivalent of a fixed-term agreement." },
  { q: "What is not included in the licence price?", a: "Implementation services, integration packs and usage-based consumption such as messaging and additional AI capacity are scoped separately. We quote these transparently before you commit." },
  { q: "Can we start with some teams and expand?", a: "Yes. Many organisations start with one or two teams. Your agreement can be expanded as more teams move onto NESJA, and your account team will confirm how additional users are priced." },
  { q: "Do you support local currencies?", a: "Pricing is displayed in USD. Contact NESJA for applicable regional or enterprise commercial terms." },
  { q: "Can we receive a formal proposal?", a: "Yes. Request a proposal with your edition, number of users and preferred term, and NESJA will prepare a commercial proposal for your organisation." },
];
