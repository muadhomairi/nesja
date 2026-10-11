# NESJA.OS — Commercial website

The marketing and conversion website for **NESJA.OS, the Commercial Operating System**.

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 3 · Zod. No UI framework or analytics vendor is hard-wired; every external service sits behind an adapter.

> **Runs fully with zero configuration.** With no environment variables set, leads, demo bookings, emails and analytics use development adapters so every flow can be tested end to end.

---

## Quick start

```bash
# Node.js 18.18+ (20 or 22 recommended)
npm install
cp .env.example .env.local     # optional: everything has a safe default
npm run dev                    # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build (type-checks and prerenders 57 routes) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit tests for the pricing engine |

In development, submitted leads are also appended to `.data/leads.ndjson`, and emails and analytics events print to the terminal and browser console.

---

## Deploying

### Vercel (recommended)
1. Push this folder to a Git repository and import it in Vercel. Framework preset: **Next.js**. No build settings need changing.
2. Add environment variables (Project → Settings → Environment Variables). At minimum set `NEXT_PUBLIC_SITE_URL` to your production domain so canonical URLs, the sitemap and Open Graph tags are correct.
3. Switch adapters from development to production as integrations go live (`LEAD_ADAPTER`, `SCHEDULING_PROVIDER`, `EMAIL_PROVIDER`, `AUTH_PROVIDER`, analytics IDs). See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md).
4. Deploy. Static pages are served from the edge; `/api/*` routes run as serverless functions.

### Any Node host (Docker, Azure App Service, AWS, a VM)
```bash
npm ci && npm run build
NODE_ENV=production PORT=3000 npm start
```
Put the app behind HTTPS. Security headers (HSTS, nosniff, frame options, referrer policy) are set in `next.config.ts`.

> **Rate limiting** uses an in-memory limiter, which is fine for a single instance. On multi-instance or serverless hosting, swap `src/lib/server/rate-limit.ts` for a shared store (Upstash Redis or Vercel KV); the function signature stays the same.

---

## Project structure

```
src/
  app/                      Routes (App Router). Pages are thin: they compose sections and read config.
    api/                    contact, subscribe, scheduling/{availability,book}, auth/sign-in, checkout
    platform/[module]/      8 module pages generated from config/modules.ts
    solutions/[role]/       7 role pages generated from config/roles.ts
    industries/[industry]/  9 SEO industry pages generated from config/industries.ts
    resources/[slug]/       Articles + the Commercial OS Manifesto (config/resources.ts)
    sitemap.ts robots.ts opengraph-image.tsx
  config/                   ← Edit content and commercial values here (CMS-ready, serialisable)
    pricing.ts              Single source of truth for all prices, terms, editions, add-ons
    modules.ts roles.ts industries.ts navigation.ts ctas.ts site.ts
    social-proof.ts         Testimonials/logos/metrics/case studies (verified + consented only)
    security.ts             Certifications and controls with honest status
    integrations.ts locales.ts resources.ts
  content/                  Homepage narrative copy and the product-journey script
  components/
    ui/                     Button, Field, Section, Badge, Icon, Logo, Faq
    layout/                 Header (mega-menu + mobile drawer), Footer, JsonLd
    sections/               Hero, Problem, Category, SystemMap, ProductJourney, AI, Trust, FinalCta…
    mockups/                Product UI mockups (labelled "Sample data")
    pricing/                PricingExperience (selector, edition cards, calculator), ComparisonTable, AddOns
    demo/                   DemoWizard (5-step booking flow + confirmation)
    forms/                  ContactForm, SignInForm, NewsletterForm
    analytics/              AnalyticsRoot, CookieConsent, TrackOnView
  lib/
    pricing/calculate.ts    Pure pricing engine (unit-tested)
    analytics/              Provider-independent event layer + adapters
    attribution.ts consent.ts validation.ts seo.ts ics.ts format.ts
    server/                 env, http helpers, rate limiter
  services/                 ← Swap development adapters for production here
    leads/                  mock | nesja | webhook | hubspot
    scheduling/             mock | calendly | microsoft-bookings | hubspot | google | custom
    email/                  console | resend | sendgrid | microsoft-graph
    auth/                   none | nesja-app | oidc
    payments/               none | stripe
  i18n/                     Dictionaries (en, ar draft) and locale helpers
  styles/tokens.css         Design tokens (brand palette, motion, radii)
tests/pricing.test.ts
docs/ARCHITECTURE.md        Design system, data models, pricing, i18n, analytics, accessibility
docs/INTEGRATIONS.md        Every adapter, its env vars and how to switch it on
```

---

## Editing common things

| I want to… | Edit |
| --- | --- |
| Change prices, discounts, terms, editions | `src/config/pricing.ts` (UI updates automatically) |
| Add a product module | Add an entry to `src/config/modules.ts`: nav, footer, system map, sitemap and its page all appear |
| Add a role or industry page | `src/config/roles.ts` / `src/config/industries.ts` |
| Publish a testimonial or case study | `src/config/social-proof.ts`, with `verified: true` and `consentStatus: "granted"` |
| Mark a certification achieved | `src/config/security.ts`, only once the certificate or report exists |
| Show social links | Set `NEXT_PUBLIC_SOCIAL_*` to the real https URLs |
| Enable self-serve trial CTAs | `NEXT_PUBLIC_FEATURE_SELF_SERVE=true` plus a payment provider |
| Change brand colours | `src/styles/tokens.css` |

See [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) for connecting real services and [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for how everything fits together.
