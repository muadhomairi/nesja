/**
 * Navigation configuration. Header, mobile drawer and footer render from
 * this file. Menu groups derive from module/role/industry config so new
 * entries appear automatically.
 */
import { modules } from "./modules";
import { roles } from "./roles";
import { industries } from "./industries";
import { features } from "./site";

export interface NavLink { label: string; href: string; description?: string }
export interface NavGroup { title: string; links: NavLink[] }
export interface NavItem {
  label: string;
  href?: string;
  groups?: NavGroup[];
  feature?: { eyebrow: string; title: string; body: string; href: string; cta: string };
}

export const mainNav: NavItem[] = [
  {
    label: "Platform",
    groups: [
      { title: "The operating system", links: [{ label: "Platform overview", href: "/platform", description: "How NESJA.OS connects the commercial lifecycle" }] },
      { title: "Modules", links: modules.map((m) => ({ label: m.name, href: `/platform/${m.slug}`, description: m.summary })) },
    ],
    feature: { eyebrow: "Category", title: "What is a Commercial Operating System?", body: "Why connecting the commercial lifecycle beats adding another point tool.", href: "/resources/commercial-operating-system-manifesto", cta: "Read the Manifesto" },
  },
  {
    label: "Solutions",
    groups: [
      { title: "By role", links: roles.map((r) => ({ label: r.role, href: `/solutions/${r.slug}`, description: r.headline })) },
      { title: "By industry", links: industries.map((i) => ({ label: i.name, href: `/industries/${i.slug}` })) },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Resources",
    groups: [
      {
        title: "Learn",
        links: [
          { label: "NESJA Perspectives", href: "/resources", description: "Research, operating models and product insights" },
          { label: "The Commercial OS Manifesto", href: "/resources/commercial-operating-system-manifesto", description: "Our point of view on the category" },
          { label: "Customers", href: "/customers", description: "Customer stories" },
          ...(features.ecosystemInNav ? [{ label: "Developers", href: "/developers" }, { label: "Marketplace", href: "/marketplace" }] : []),
        ],
      },
    ],
  },
  {
    label: "Company",
    groups: [
      {
        title: "Company",
        links: [
          { label: "About NESJA", href: "/about", description: "The story behind the name" },
          { label: "Security & trust", href: "/security", description: "How we protect your commercial data" },
          { label: "Integrations", href: "/integrations", description: "Works with the systems you already run" },
          { label: "Talk to Sales", href: "/contact?type=sales", description: "Talk to the NESJA team" },
          { label: "Partners", href: "/partners", description: "Partner with NESJA" },
        ],
      },
    ],
  },
];

export const footerNav: NavGroup[] = [
  { title: "Platform", links: [{ label: "Overview", href: "/platform" }, ...modules.map((m) => ({ label: m.label, href: `/platform/${m.slug}` })), { label: "Pricing", href: "/pricing" }] },
  { title: "Solutions", links: [{ label: "All solutions", href: "/solutions" }, ...roles.slice(0, 5).map((r) => ({ label: r.role, href: `/solutions/${r.slug}` })), { label: "Industries", href: "/industries" }] },
  { title: "Resources", links: [{ label: "NESJA Perspectives", href: "/resources" }, { label: "Manifesto", href: "/resources/commercial-operating-system-manifesto" }, { label: "Customer stories", href: "/customers" }, { label: "Integrations", href: "/integrations" }] },
  { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Security", href: "/security" }, { label: "Partners", href: "/partners" }, { label: "Contact", href: "/contact" }, { label: "Book a Demo", href: "/book-demo" }] },
];

export const legalNav: NavLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
];
