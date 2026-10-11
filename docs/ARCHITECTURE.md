# Architecture

## 1. Requirements audit (how the brief maps to the build)

| Brief | Implementation |
| --- | --- |
| Premium dark brand system | Tokens in `src/styles/tokens.css`, Tailwind theme mapped to CSS variables, Manrope variable font (self-hosted) |
| Behavioural journey (Recognition → Action) | Homepage order: Hero → Problem → Category → System map → Product journey → AI → Trust → Pricing → Final CTA |
| One dominant CTA | `ButtonLink variant="primary"` used once per view; "Book a Demo" pinned in header and mobile drawer |
| No fabricated proof | `social-proof.ts` selectors render only `verified` and `consentStatus: "granted"` content; arrays ship empty |
| Honest security | `security.ts` statuses (achieved, in progress, planned, hidden); everything defaults to Planned |
| Pricing from one config | `config/pricing.ts` → `lib/pricing/calculate.ts` → UI; unit-tested |
| No pre-selected long-term contract | `defaultTerm: "monthly"`; "Most popular" is a label, not a default |
| Functional forms and booking | Zod validation on client and server, honeypot, rate limit, adapters with mock backends |
| i18n, RTL and currencies | `config/locales.ts`, `src/i18n`, logical CSS properties, `dir` on `<html>`, currency price books |
| Analytics, attribution, consent | Provider-agnostic `track()`, consent-gated loading, first and last touch attribution |
| SEO | Per-page metadata, canonical URLs, OG/Twitter, generated OG image, sitemap, robots, JSON-LD (Organization, SoftwareApplication, FAQ, Breadcrumb, Article; Product only when `publishStructuredOffers`) |
| Future-ready routes | `/integrations`, `/partners`, `/developers`, `/marketplace`, `/signup` (feature-flagged) |

## 2. Information architecture

```
/                         Home (narrative funnel)
/platform                 System map, modules, product journey, category
/platform/{pipeline,accounts,quote,contracts,engage,success,intelligence,ai}
/solutions                Roles and industries index
/solutions/{ceo,chief-commercial-officer,sales-leader,sales-operations,marketing,finance,customer-success}
/industries               Industry index
/industries/{financial-services,telecommunications,healthcare,government,utilities,technology,professional-services,retail,travel-hospitality}
/pricing                  Term selector, editions, calculator, comparison, add-ons, FAQ
/customers                Verified stories only (honest empty state)
/resources                Library, flagship Manifesto, subscription
/resources/{slug}         Article and Manifesto (print to PDF)
/about /security /contact /book-demo /login
/integrations /partners /developers /marketplace /signup
/privacy /terms /cookies
/api/{contact,subscribe,scheduling/availability,scheduling/book,auth/sign-in,checkout}
```

## 3. Design tokens

| Token | Value | Use |
| --- | --- | --- |
| `midnight` | #0C1324 | Dominant base |
| `midnight-900/800/700/600` | derived | Depth: footer, surfaces, raised panels |
| `teal` (Neural Teal) | #12C6C2 | Primary CTA, active states, key intelligence signals, data highlights |
| `signal` (Signal Blue) | #4B6BFF | Secondary intelligence, AI, diagrams, connections |
| `cloud` | #F5F7FB | Headings and primary text |
| `silver` | #C9D1DC | Body text on dark |
| `mist` | #9AA5B8 | Secondary text (AA contrast on Midnight; Slate Graphite is reserved for decoration) |
| `graphite` | #5B6678 | Borders and decorative only |

Type scale: `display-xl/lg/md` (fluid `clamp`), base 15 to 17px. Motion: `--ease-brand` cubic-bezier(0.22, 1, 0.36, 1), 160/280/700ms. Every animation is disabled under `prefers-reduced-motion`.

## 4. Component architecture

- **ui/**: primitives (`Button`/`ButtonLink` with optional analytics, `TextField`/`TextArea`/`SelectField`/`Honeypot`/`FormAlert`, `Section`/`PageHero`/`Badge`, `Icon`, `Logo`, `Faq`).
- **layout/**: `Header` (sticky, mega-menu with hover intent, Escape and outside-click handling, mobile drawer), `Footer`, `JsonLd`.
- **sections/**: page sections, each answering one question. Server components unless interactive.
- **Client islands**: only `Header`, `SystemMap`, `ProductJourney`, `PricingExperience`, `ComparisonTable`, `DemoWizard`, forms, consent and analytics ship JavaScript. Everything else is static HTML.

## 5. Data and configuration models

Typed, serialisable and CMS-ready: `ProductModule`, `RoleSolution`, `Industry`, `Resource` (block content), `Testimonial` (name, jobTitle, company, photo, quote, industry, country, videoUrl, consentStatus, verified, featured), `CustomerLogo` (logoUsageApproved), `Metric` (verified), `CaseStudy`, `Recognition`, `TrustItem`, `Integration`, `NavItem`, `LocaleDefinition`, `CurrencyDefinition`.

## 6. Pricing architecture

```
Edition.priceBook[currency][term] = price per user per month
calculateQuote({ editionId, termId, seats, currency }) →
  listPricePerUser (monthly anchor) · pricePerUser · monthlyCost · annualCost
  contractValue (monthlyCost × months) · totalSavings vs monthly · savingsRate · savingsPercent (floored)
  status: priced | custom (Enterprise) | unavailable (no price book for currency)
```

- Volume tiers (`volumeTiers`) stack on term pricing and are empty by default.
- Regional pricing: add a currency key to an edition's `priceBook`. The currency selector appears automatically once more than one currency is priced.
- Future components: `addOns` (module, integration, implementation, communication, AI) with `per-user`, `flat-monthly`, `usage`, `one-off` or `quoted` models.
- Placeholders: Essential uses the brief's ladder ($99, $84, $74, $64). **Professional values ($139, $118, $104, $90) and the comparison-table entries are placeholders to confirm.**

## 7. Responsive behaviour

- Breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280.
- Header: full mega-menu at `lg+`; below that a compact "Book a Demo" button stays visible next to the menu button, and the drawer pins the CTAs at the bottom.
- Hero visual: horizontal convergence at `sm+`, vertical convergence on phones.
- System map: orbital diagram at `md+`, two-column module grid on phones, with a shared detail panel.
- Product journey: vertical tab list at `lg+`; previous/next stepper on smaller screens.
- Pricing: term selector in 2×2 on phones; calculator stacks inputs above results; comparison table scrolls horizontally with a sticky first column.
- Demo booking: single-column wizard; date strip scrolls horizontally; time grid is 3 columns on phones.

## 8. Accessibility (WCAG 2.2 AA target)

Skip link, landmark structure, one `h1` per page, visible focus rings, keyboard-operable menus (Escape closes and returns focus), WAI-ARIA tabs for the journey (arrow keys, Home, End), native radios for all selectors, labelled fields with `aria-describedby` errors, `role="alert"` and `role="status"` messaging, focus moved to each wizard step's heading, `prefers-reduced-motion` respected, and contrast-checked text tokens. Automated axe-core checks pass on the main templates.

## 9. Performance

Static prerendering for all content pages (57 routes), client JavaScript limited to interactive islands (~103 kB shared), a self-hosted variable font with `display: swap`, SVG and CSS for visuals (no images to load), and AVIF/WebP configured for future imagery via `next/image`.

## 10. Internationalisation

`<html lang dir>` comes from the locale config, and components use logical properties (`ms-`, `me-`, `ps-`, `pe-`, `start-`, `end-`) with `rtl:` variants for directional icons. To launch Arabic: write Arabic copy (not a mirrored translation), enable `ar` in `config/locales.ts`, move routes under `app/[locale]/`, and add middleware that resolves the locale from the URL prefix. The `ar` UI dictionary is a draft for native review.
