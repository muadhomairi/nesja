/**
 * Global site configuration. Values that differ per environment come from
 * environment variables (see .env.example); everything else is editable here.
 */
export const siteConfig = {
  name: "NESJA.OS",
  shortName: "NESJA",
  category: "The Commercial Operating System",
  tagline: "One commercial fabric. Infinite intelligence.",
  description:
    "NESJA.OS is the Commercial Operating System. It connects marketing, pipeline management, CPQ and quoting, contract management, communication, customer success and commercial intelligence in one AI-powered platform.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  /** Where "Sign in" ultimately sends users once the NESJA application is connected. */
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  /** Optional overview video shown after booking. Hidden until a real URL is configured. */
  overviewVideoUrl: process.env.NEXT_PUBLIC_OVERVIEW_VIDEO_URL || "",
  /**
   * Social profiles render only when a valid https URL is configured.
   * Leave blank until official profiles exist.
   */
  social: {
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || "",
    youtube: process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE || "",
    x: process.env.NEXT_PUBLIC_SOCIAL_X || "",
  },
  legalEntity: process.env.NEXT_PUBLIC_LEGAL_ENTITY || "NESJA",
} as const;

/** Feature flags let the site grow (self-serve, Arabic, currencies) without a rebuild. */
export const features = {
  /** Shows START FREE / START TRIAL CTAs and the checkout route. Off until self-serve exists. */
  selfServeSignup: process.env.NEXT_PUBLIC_FEATURE_SELF_SERVE === "true",
  /** Currency selector on pricing. Only currencies with a configured price book appear. */
  currencySelector: true,
  /** Language switcher. Turn on when Arabic content is reviewed and complete. */
  localeSwitcher: false,
  /** Roadmap ecosystem pages (developers, marketplace) are routable but kept out of navigation until available. */
  ecosystemInNav: false,
} as const;

export const brandStatements = {
  primary: "Different commercial functions. One intelligent operating system.",
  fabric: "One commercial fabric. Infinite intelligence.",
  smarter: "A more intelligent way to do business.",
  motion: "Every commercial motion. One operating system.",
  verbs: "Connect. Orchestrate. Grow.",
} as const;
