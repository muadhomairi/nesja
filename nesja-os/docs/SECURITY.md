# Security model

## Tenancy
- Every business table carries `tenant_id`; primary keys are `(tenant_id, id)` and every foreign key includes `tenant_id`, so a row can never reference another tenant's row.
- Row-level security is enabled on every table in `public`. Policies call `private.can(tenant, permission, owner, unit)`, which checks an **active membership** in a tenant whose status is `trial` or `active`, the role's permission, and its scope (`own`, `business_unit`, `all`).
- Roles are per tenant, copied from templates at provisioning (owner, admin, executive, sales manager, account manager, bid manager, finance, viewer).
- Views (`quote_totals`, `data_quality_issues`, `reconciliation_checks`, `forecast_months`) are `security_invoker`, so RLS applies to them too.
- The `anon` role has no table access.

## Server access
- The app talks to Postgres as the signed-in user: each request opens a transaction, `set local role authenticated` and sets `request.jwt.claims` to the verified Supabase user id, exactly as PostgREST does. There is no service-role bypass for user requests.
- The service-role key and database URL are server-only environment variables. Nothing secret is prefixed `NEXT_PUBLIC_`.
- `withSystem` (no RLS) is used only for bookkeeping: rate limits, audit entries for exports, scheduled jobs.
- In production set `DATABASE_CA_CERT` (Supabase dashboard → Database → SSL) so the TLS certificate is verified; without it the connection is encrypted but not verified.

## Controls enforced in the database
- Quotations lock once issued, accepted or superseded; changes need a new revision.
- Approvals: the approver can never be the requester (check constraint plus policy).
- `audit_log` is append-only (trigger blocks update/delete); a generic trigger writes before/after images for business tables.
- Documents live in the private `tenant-documents` bucket under `<tenant_id>/…`; storage policies check the prefix and document permissions.
- Invitations store only a SHA-256 hash of the token and must be accepted by the invited e-mail address.
- Demo records exist only in tenants of kind `demo` (trigger-enforced); demo → live conversion copies configuration, never records.

## Authentication
- E-mail + password (12+ characters, mixed case and digits), e-mail verification, TOTP MFA; MFA-enrolled users must reach AAL2 before any page loads.
- Rate limits on sign-in, sign-up, organization creation and demo sessions (keys hashed).
- Security headers: HSTS (preload), X-Frame-Options DENY, nosniff, referrer policy, permissions policy. A Content-Security-Policy is **not** set yet; add one (nonce-based) before launch.

## CSV exports
Need `data.export` plus the module's view permission, run under RLS, neutralise spreadsheet formulas, and are written to the audit log.

## Not claimed
No external certification (ISO 27001, SOC 2) or regulatory compliance is claimed. Penetration testing has not been performed.
