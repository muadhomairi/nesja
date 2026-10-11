/** English UI dictionary (source of truth for keys). */
export const en = {
  nav: { openMenu: "Open menu", closeMenu: "Close menu", skipToContent: "Skip to content", primary: "Primary" },
  cta: { bookDemo: "Book a Demo", explore: "Explore NESJA", signIn: "Sign In", talkToSales: "Talk to Sales", startTrial: "Start free trial" },
  form: { required: "Required", optional: "Optional", submit: "Submit", sending: "Sending…", back: "Back", continue: "Continue" },
  consent: {
    title: "Your privacy choices",
    body: "We use necessary cookies to run this site. With your permission we'd also use analytics to understand how it's used, and marketing cookies to measure campaigns.",
    acceptAll: "Accept all",
    rejectAll: "Necessary only",
    customise: "Customise",
    save: "Save choices",
  },
} as const;

type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
export type Dictionary = Widen<typeof en>;
