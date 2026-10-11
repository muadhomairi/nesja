/** Central CTA definitions so wording and destinations stay consistent everywhere. */
export const ctas = {
  bookDemo: { label: "Book a Demo", href: "/book-demo" },
  explore: { label: "Explore NESJA", href: "/platform" },
  explorePlatform: { label: "Explore the Platform", href: "/platform" },
  exploreOS: { label: "Explore NESJA.OS", href: "/platform" },
  seeInAction: { label: "See NESJA in Action", href: "/book-demo?interest=everything" },
  talkToSales: { label: "Talk to Sales", href: "/contact?type=enterprise" },
  startTrial: { label: "Start free trial", href: "/signup" },
  signIn: { label: "Sign In", href: "/login" },
} as const;
