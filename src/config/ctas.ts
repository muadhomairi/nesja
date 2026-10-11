/**
 * Central CTA definitions so wording and destinations stay consistent everywhere.
 * Hierarchy: Book a Demo (primary) → Talk to Sales (secondary commercial) →
 * contextual CTAs (proposal, integration, security) only where they fit.
 */
export const ctas = {
  bookDemo: { label: "Book a Demo", href: "/book-demo" },
  explore: { label: "Explore NESJA", href: "/platform" },
  explorePlatform: { label: "Explore the Platform", href: "/platform" },
  exploreOS: { label: "Explore NESJA.OS", href: "/platform" },
  seeInAction: { label: "See NESJA in Action", href: "/book-demo?interest=everything" },
  talkToSales: { label: "Talk to Sales", href: "/contact?type=sales" },
  talkToSalesEnterprise: { label: "Talk to Sales", href: "/contact?type=enterprise" },
  requestProposal: { label: "Request a Proposal", href: "/contact?type=proposal" },
  discussRequirements: { label: "Discuss Your Requirements", href: "/contact?type=sales" },
  discussIntegration: { label: "Discuss Your Integration Requirements", href: "/contact?type=integration" },
  requestSecurity: { label: "Request Security Information", href: "/contact?type=security" },
  discussPartnership: { label: "Discuss a Partnership", href: "/contact?type=partnership" },
  startTrial: { label: "Start free trial", href: "/signup" },
  signIn: { label: "Sign In", href: "/login" },
} as const;
