# Integrations

Every external dependency sits behind an adapter chosen by an environment variable. Development adapters are the default, so the full UX works locally. **Lines marked ▶ REPLACE in the code show where to switch to production.**

| Capability | Selector | Development default | Production options | Code |
| --- | --- | --- | --- | --- |
| Lead capture | `LEAD_ADAPTER` | `mock` (memory + `.data/leads.ndjson`) | `nesja`, `webhook`, `hubspot` | `src/services/leads` |
| Demo scheduling | `SCHEDULING_PROVIDER` | `mock` (real slots from working hours) | `calendly`, `microsoft-bookings`, `hubspot`, `google`, `custom` | `src/services/scheduling` |
| Transactional email | `EMAIL_PROVIDER` | `console` | `resend`, `sendgrid`, `microsoft-graph` | `src/services/email` |
| Sign in | `AUTH_PROVIDER` | `none` (explains it isn't connected) | `nesja-app`, `oidc` | `src/services/auth` |
| Payments / checkout | `PAYMENT_PROVIDER` | `none` (no simulated transactions) | `stripe` | `src/services/payments` |
| Analytics | `NEXT_PUBLIC_ANALYTICS_PROVIDERS` | `console` (dev only) | `gtm`, `ga4`, `segment`, `posthog`, `mixpanel`, `hubspot` | `src/lib/analytics` |

---

## Lead capture: NESJA uses NESJA to sell NESJA

All forms produce one canonical `Lead` (`src/services/leads/types.ts`):

```ts
{ type: "demo_request" | "contact_sales" | "subscription",
  category: "DEMO" | "SALES" | "PROPOSAL" | "ENTERPRISE" | "IMPLEMENTATION"
          | "INTEGRATION" | "SECURITY" | "PARTNERSHIP" | "GENERAL",   // none for subscriptions
  contact: { name, email, company, role, country },
  details: { teamSize, interest, bookingId, message, … },
  attribution: { firstTouch, lastTouch },      // UTM, referrer, landing page, timestamps
  source: { page, formContext },               // page submitted from + which form/CTA (e.g. "contact:proposal:pricing-calculator")
  meta: { userAgent, referer, submittedAt } }
```

- **`nesja`**: `POST {NESJA_API_URL}/v1/leads` with `Authorization: Bearer {NESJA_API_KEY}`. This is the long-term target: website leads, demos and their attribution land directly in NESJA as Leads, then flow through Opportunity, Quote, Contract and Customer Success. Adjust the path and payload in `adapters/nesja.ts` to the published API.
- **`webhook`**: `POST {LEAD_WEBHOOK_URL}` with the JSON lead; with `LEAD_WEBHOOK_SECRET`, an `X-Nesja-Signature` HMAC-SHA256 header. Works with Zapier, Make, n8n or Power Automate.
- **`hubspot`**: HubSpot Forms API (`HUBSPOT_PORTAL_ID`, `HUBSPOT_FORM_GUID`).
- `LEAD_NOTIFICATION_EMAIL`: optional internal notification for every lead, through the email adapter.

A failed lead write never cancels a confirmed booking; it is logged on the server.

Enquiry categories live in `src/config/enquiries.ts`. CTAs link to `/contact?type=<category>&from=<cta-location>` and the form preselects the category, so every enquiry arrives classified.

**Production without an adapter.** With `LEAD_ADAPTER` unset, the `mock` adapter writes each complete lead to the server log as one `[leads:unrouted] {...}` JSON line, so nothing is silently discarded, but logs are not a durable store. Set `LEAD_ADAPTER` (and ideally `LEAD_NOTIFICATION_EMAIL` with an email provider) before relying on the website for pipeline.

**Demo requests without a calendar.** With `SCHEDULING_PROVIDER=mock`, the visitor chooses a *preferred* time and the confirmation says the NESJA team will confirm it. Nothing tells the visitor they are booked until a real scheduler is connected.

## Demo scheduling

Interface (`src/services/scheduling/types.ts`): `getAvailability({ from, to, timezone }) → Slot[]` and `book(request) → BookingResult` with `calendarStatus: invite_sent | pending | not_sent`.

| Provider | Variables | Notes |
| --- | --- | --- |
| `mock` | `SCHEDULING_HOST_TIMEZONE`, `SCHEDULING_HOURS`, `SCHEDULING_WORKDAYS`, `SCHEDULING_SLOT_MINUTES`, `SCHEDULING_MIN_NOTICE_HOURS`, `SCHEDULING_MEETING_METHOD` | DST-safe slot generation and double-booking protection in memory. |
| `calendly` | `CALENDLY_API_TOKEN`, `CALENDLY_EVENT_TYPE_URI` | Availability via `event_type_available_times`; booking via the Scheduling API `POST /invitees` (needs a paid Calendly plan). |
| `microsoft-bookings` | `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET`, `MS_BOOKINGS_BUSINESS_ID`, `MS_BOOKINGS_SERVICE_ID`, `MS_BOOKINGS_STAFF_IDS` | Graph `getStaffAvailability` + `appointments`. App permission `BookingsAppointment.ReadWrite.All`. Returns the Teams join link. |
| `hubspot` | `HUBSPOT_PRIVATE_APP_TOKEN`, `HUBSPOT_MEETING_SLUG` | Scheduler API v3 meeting links. |
| `google` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`, `GOOGLE_CALENDAR_ID` | Free/busy plus event insert with a Google Meet link and `sendUpdates=all`. |
| `custom` | `SCHEDULING_API_URL`, `SCHEDULING_API_KEY` | Contract: `GET /availability?from&to&timezone → { slots }`, `POST /bookings → BookingResult`, `409` when a slot is taken. |

Verify request and response field names against each vendor's current API reference when enabling. The adapters follow their documented endpoints and are isolated to one file each.

## Email

Templates live in `src/services/email/templates.ts` (demo confirmation with an `.ics` attachment, contact acknowledgement, internal notification). Set `EMAIL_FROM` for every provider.

- `resend`: `RESEND_API_KEY`
- `sendgrid`: `SENDGRID_API_KEY`
- `microsoft-graph`: `MS_TENANT_ID`, `MS_CLIENT_ID`, `MS_CLIENT_SECRET` (`Mail.Send` application permission), `EMAIL_GRAPH_SENDER`

Email failures are logged and never fail the user's booking or enquiry.

## Sign in

The website never handles passwords. `/login` collects an email and `POST /api/auth/sign-in` returns a redirect:

- `nesja-app`: `{NEXT_PUBLIC_APP_URL}{AUTH_LOGIN_PATH}?login_hint=email`
- `oidc`: discovers `OIDC_ISSUER`'s authorization endpoint and redirects with `OIDC_CLIENT_ID` / `OIDC_REDIRECT_URI` (the NESJA app completes the code exchange).

## Payments (future self-serve)

`PAYMENT_PROVIDER=stripe` with `STRIPE_SECRET_KEY` and one price ID per edition and term (`STRIPE_PRICE_ESSENTIAL_12M`, …) creates a Stripe Checkout Session with quantity = seats. Pair with `NEXT_PUBLIC_FEATURE_SELF_SERVE=true`. With `none`, `/api/checkout` returns `501` and no purchase UI is shown.

## Analytics

- Typed event catalogue: `src/lib/analytics/events.ts` (`hero_demo_clicked`, `platform_explored`, `pricing_viewed`, `pricing_duration_changed`, `seat_count_changed`, `pricing_cta_clicked`, `demo_started`, `demo_completed`, `contact_sales_clicked`, `module_viewed`, `case_study_viewed`, `resource_downloaded`, `signup_started`, `signup_completed`, and more).
- Call `track("event_name", props)` anywhere on the client. Events are held until the visitor makes a consent choice, then replayed only to providers whose category (analytics or marketing) was granted.
- Enable providers with `NEXT_PUBLIC_ANALYTICS_PROVIDERS=gtm,posthog` plus each provider's ID (`NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_SEGMENT_WRITE_KEY`, `NEXT_PUBLIC_POSTHOG_KEY`/`HOST`, `NEXT_PUBLIC_MIXPANEL_TOKEN`, `NEXT_PUBLIC_HUBSPOT_PORTAL_ID`).
- Add a provider by implementing `AnalyticsProvider` in `providers.ts` (`load`, `track`, `page`).

## Attribution

`src/lib/attribution.ts` captures `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`, referrer, landing page, first touch and last touch. It persists in localStorage when analytics or marketing consent is granted, and otherwise for the current visit only in sessionStorage. Every form sends it with the lead.

## Headless CMS

Content is plain serialisable data in `src/config/*` and `src/content/*`, and resource bodies are structured blocks (`p`, `h2`, `h3`, `quote`, `list`). To move to a CMS such as Sanity, Contentful, Payload or Strapi, replace the exports (`modules`, `roles`, `industries`, `resources`, `testimonials`…) with async fetchers that return the same types; pages already render from those types.
