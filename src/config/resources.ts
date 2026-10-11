/**
 * Resource library. Body content is structured blocks so a headless CMS
 * (Sanity, Contentful, Payload, Strapi…) can replace this file later
 * without touching page components.
 */
export type ResourceType = "insight" | "guide" | "research" | "playbook" | "product-update" | "webinar" | "manifesto";

export const resourceTypes: { id: ResourceType; label: string; description: string }[] = [
  { id: "insight", label: "Insights", description: "Perspectives on how commercial organisations operate." },
  { id: "guide", label: "Guides", description: "Practical guidance for commercial leaders." },
  { id: "research", label: "Research", description: "Original research on commercial operations." },
  { id: "playbook", label: "Commercial Playbooks", description: "Step-by-step plays for common commercial challenges." },
  { id: "product-update", label: "Product Updates", description: "What's new in NESJA.OS." },
  { id: "webinar", label: "Webinars", description: "Sessions with the NESJA team." },
];

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; items: string[] };

export interface Resource {
  slug: string;
  type: ResourceType;
  title: string;
  excerpt: string;
  readingMinutes: number;
  publishedAt: string;
  featured?: boolean;
  /** Printable resources offer "Save as PDF" (tracked as resource_downloaded). */
  printable?: boolean;
  body: Block[];
}

export const resources: Resource[] = [
  {
    slug: "commercial-operating-system-manifesto",
    type: "manifesto",
    title: "The Commercial Operating System Manifesto",
    excerpt: "Commercial organisations were never meant to run on seven disconnected systems. This is the case for operating them as one.",
    readingMinutes: 9,
    publishedAt: "2026-10-01",
    featured: true,
    printable: true,
    body: [
      { type: "p", text: "Every company is a commercial organisation. Whatever it makes or delivers, it survives by finding customers, agreeing terms with them, keeping its promises and growing the relationship. That work is the commercial operation. In most companies it runs on a patchwork." },
      { type: "h2", text: "I. Your customers see one company" },
      { type: "p", text: "A customer experiences a single journey. They hear about you, speak to someone, receive a proposal, negotiate, sign, onboard and, if it goes well, buy more. To them it is one relationship with one company." },
      { type: "p", text: "Inside the company, that same journey is split across a lead platform, a CRM, spreadsheets, a quotation tool, inboxes, a contract repository, a customer success tool and a reporting layer. Each was bought to solve a real problem. Together they create a new one." },
      { type: "quote", text: "Your customers see one company. Why does your commercial team see seven systems?" },
      { type: "h2", text: "II. Fragmentation is a tax you pay every day" },
      { type: "p", text: "Fragmentation rarely fails loudly. It shows up as a follow-up nobody owned, a quote that took four days because pricing lived in someone's spreadsheet, a renewal discovered a week before it lapsed, a forecast that changed depending on who built it. None of these is dramatic on its own. Added together, they set the ceiling on how well a commercial organisation can perform." },
      { type: "list", items: ["The same customer entered several times, slightly differently each time", "Context lost at every handoff between marketing, sales, delivery and success", "Pricing policy that exists on paper but not in practice", "Leaders reconciling reports instead of making decisions"] },
      { type: "h2", text: "III. Integration is not the same as operation" },
      { type: "p", text: "The usual answer is integration: connect the tools and sync the data. Integration moves records between systems. It does not give the organisation a shared process, shared accountability or a shared understanding of the customer. Ten well-integrated tools are still ten places to look and ten definitions of the truth." },
      { type: "h2", text: "IV. The category: Commercial Operating System" },
      { type: "p", text: "A Commercial Operating System is a single environment in which the full commercial lifecycle runs: demand, pipeline, accounts, quoting, contracts, communication, customer success and intelligence. It is defined by three properties." },
      { type: "list", items: ["One data model. A customer, an opportunity, a quote and a contract are connected records, not copies.", "One process. The commercial motion is designed once and governed end to end, across functions.", "One intelligence layer. Reporting and AI see the whole lifecycle, so their answers reflect the whole business."] },
      { type: "p", text: "A CRM records relationships. CPQ builds quotes. Contract platforms store agreements. Customer success tools manage retention. BI reports on all of them after the fact. A Commercial Operating System connects the operating environment they were each trying to serve." },
      { type: "h2", text: "V. Intelligence needs a whole picture" },
      { type: "p", text: "AI is only as useful as the context it can see. An assistant bolted onto one tool can summarise that tool. Intelligence woven through the commercial lifecycle can notice that a deal is stalling because the quote is waiting on approval, that a renewal is at risk because commitments in the contract have slipped, or that pricing exceptions in one region are eroding margin. That requires one connected fabric of data." },
      { type: "h2", text: "VI. Why we call it NESJA" },
      { type: "p", text: "NESJA comes from the Arabic نسج, to weave. A commercial organisation is made of threads: people, customers, conversations, opportunities, proposals, contracts, relationships, data and decisions. Separately they are fragile. Woven together they become a fabric that holds." },
      { type: "quote", text: "One commercial fabric. Infinite intelligence." },
      { type: "h2", text: "VII. What we believe" },
      { type: "list", items: ["Commercial work should be designed as one system, not assembled from many.", "Every person who serves a customer deserves the whole context of that customer.", "Commercial policy should be built into the work, not policed after it.", "Leaders should decide from one version of the truth.", "Intelligence belongs inside the work, not beside it."] },
      { type: "p", text: "Connect. Orchestrate. Grow. That is the work of a Commercial Operating System, and it is what NESJA.OS does." },
    ],
  },
  {
    slug: "what-is-a-commercial-operating-system",
    type: "insight",
    title: "What is a Commercial Operating System?",
    excerpt: "A plain-language definition, and how it differs from CRM, CPQ, CLM and BI.",
    readingMinutes: 5,
    publishedAt: "2026-10-01",
    printable: true,
    body: [
      { type: "p", text: "A Commercial Operating System (Commercial OS) is a single software environment that runs the full commercial lifecycle of an organisation, from first marketing signal to renewal and expansion, on one connected data model." },
      { type: "h2", text: "How it differs from the tools you know" },
      { type: "list", items: ["CRM records customer relationships and activities.", "CPQ configures products and builds quotations.", "Contract lifecycle management stores and governs agreements.", "Customer success platforms manage onboarding, health and retention.", "BI tools report on performance, usually after data is exported from all of the above."] },
      { type: "p", text: "Each category solves part of the commercial problem. A Commercial OS treats the lifecycle as one system, so the opportunity, the quote, the contract and the customer's health are connected records rather than copies in separate tools." },
      { type: "h2", text: "Signs you need one" },
      { type: "list", items: ["Your teams re-key the same information into several systems.", "Quotes depend on spreadsheets and email approvals.", "Customer success learns what was promised after the customer tells them.", "Leadership reports require manual reconciliation."] },
      { type: "h2", text: "What to look for" },
      { type: "p", text: "Look for a unified data model rather than synced copies, a process that can be governed end to end, commercial policy such as pricing and approvals enforced inside the workflow, and intelligence that can see across the lifecycle." },
    ],
  },
];

export const getResource = (slug: string) => resources.find((r) => r.slug === slug);
export const resourceTypeLabel = (t: ResourceType) => (t === "manifesto" ? "Manifesto" : resourceTypes.find((r) => r.id === t)?.label ?? t);
