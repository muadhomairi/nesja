/**
 * Homepage narrative content (Recognition → Tension → Understanding → Desire
 * → Proof → Economics → Action). Kept outside components so a CMS can own it.
 */
export const hero = {
  eyebrow: "The Commercial Operating System",
  headline: ["Your commercial operation.", "One intelligent system."],
  body: "NESJA.OS connects sales, marketing, quoting, contracts, communication, customer success and intelligence into one Commercial Operating System.",
  supporting: "See how NESJA can work across your commercial organisation.",
  streams: ["Marketing", "Sales", "Pipeline", "Revenue", "Contracts", "Communication", "Customer Success", "Intelligence"],
  outcome: "Growth",
};

export const problem = {
  eyebrow: "The cost of fragmentation",
  headline: ["Your customers see one company.", "Why does your commercial team see seven systems?"],
  flow: ["Lead Platform", "CRM", "Spreadsheet", "Quotation", "Email", "Contracts", "Customer Success", "Reporting"],
  issues: [
    { title: "Duplicate data", body: "The same customer, entered in several places, slightly differently each time." },
    { title: "Lost follow-ups", body: "Next steps live in inboxes and memory instead of the record." },
    { title: "Disconnected teams", body: "Marketing, sales, finance and success each work from their own version." },
    { title: "Slow quotation", body: "Pricing sits in spreadsheets and approvals wait in email." },
    { title: "Weak visibility", body: "Leadership sees performance only after someone assembles it." },
    { title: "Fragmented conversations", body: "Customer communication scattered across people and channels." },
    { title: "Poor accountability", body: "When work crosses systems, ownership blurs." },
    { title: "Inconsistent process", body: "Each team, region and individual sells a little differently." },
  ],
  resolution: ["One customer.", "One commercial journey.", "One source of truth."],
};

export const category = {
  eyebrow: "A new category",
  headline: "Not a better CRM. A Commercial Operating System.",
  body: "Point tools each solve part of the commercial problem. NESJA.OS connects the whole operating environment they were built to serve.",
  rows: [
    { name: "CRM", does: "Records customer relationships" },
    { name: "CPQ", does: "Builds quotations" },
    { name: "Contract platforms", does: "Manage agreements" },
    { name: "Customer Success tools", does: "Manage retention" },
    { name: "BI", does: "Reports performance" },
  ],
  nesja: { name: "NESJA.OS", does: "Connects the complete commercial operating environment" },
};

export const aiCapabilities = [
  "Pipeline risk detection", "Next-best action", "Account summaries", "Meeting preparation", "Quotation assistance", "Proposal assistance",
  "Contract insights", "Opportunity recommendations", "Customer health", "Sentiment intelligence", "Executive summaries", "Forecasting", "Anomaly detection",
];

export const finalCta = {
  headline: ["Your commercial operation is already connected.", "NESJA makes it work that way."],
  supporting: "One platform. Every commercial motion.",
};
