# Feature parity with the Commercial Hub reference (V1.5.1-F)

Logic was ported and rebuilt tenant-aware. No Infoline data, branding or customers were copied.
**Done** = built and covered by tests. **Partial** = usable but missing parts listed. **Not yet** = not built.

| Reference module | NESJA.OS | Status | Notes |
|---|---|---|---|
| Accounts / Account 360 | `/commercial/accounts` | Partial | List, filters, Account 360 with pipeline, contracts, activities, actuals. CSV import at onboarding. No create/edit form yet. |
| Leads | `/commercial/leads` | Partial | List and filters. No lead capture form or lead → opportunity conversion UI yet. |
| Opportunities | `/commercial/opportunities` | Done | Create, stage control with history, generated TCV/ACV/weighted/margin, close-won rules. |
| Quotations / CPQ | `/commercial/quotes` | Done | Live decimal-safe pricing, revisions, lock on issue, margin approval, multi-year schedule. Printable quote document not yet. |
| Resource costing | `/commercial/costing` | Done | Employee and bundle monthly cost, amortisation, target-margin pricing. |
| Tenders | `/commercial/tenders` | Partial | List and status. No bid checklist workflow yet. |
| Contracts | `/commercial/agreements` | Partial | Agreements with values, dates, actuals. No create/edit or printable agreement yet. |
| Renewals | `/commercial/renewals` | Done | Due windows, risk, uplift. |
| Approvals | `/commercial/approvals` | Done | Segregation of duties enforced in the database. |
| Delegations | — | Not yet | Approval delegation while away. |
| Activities | `/commercial/activities` | Partial | List. No create form or calendar sync. |
| Notifications | `/commercial/notifications` | Done | In-app. E-mail digests not yet. |
| Search | `/commercial/search` | Done | Across accounts, opportunities, quotes. |
| Dashboards / analytics | `/commercial` | Done | Command center KPIs with drill-down. |
| Performance (MIS) | `/commercial/performance` | Done | Actuals vs budget, YTD, unit/account/agreement drill-down. |
| Forecast | `/commercial/forecast` | Done | Contracted, commit, best case, weighted pipeline over 12 months. |
| Data quality | `/commercial/data-quality` | Done | 8 rules plus 3 financial reconciliation checks. |
| Reports | CSV exports | Partial | Exports for accounts, opportunities, agreements, renewals, actuals, data quality, forecast. No report builder. |
| Imports | Onboarding | Partial | Accounts CSV only. |
| Sales kit | `/commercial/documents` | Partial | Tenant document storage with permissions. No curated sales-kit library. |
| Client success | — | Not yet | Health scores exist on accounts; no success plans. |
| Communications | — | Not yet | |
| Reviews (deal reviews) | — | Not yet | |
| Admin | `/admin` | Partial | Users, invitations, roles (view), audit, entitlements, integrations. Role permission editing not yet. |
| — (new) Multi-tenancy, onboarding, launcher, demo | various | Done | Not in the single-tenant reference. |
| — (new) AI assistant | `/commercial/assistant` | Not configured | Architecture only; no provider key, no output. |
| — (new) Subscription billing | — | Off | No approved prices or payment credentials. |
