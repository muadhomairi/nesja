# Deployment

**Nothing below has been executed yet.** Each step needs credentials or approval listed at the end.

## Environments
| | Supabase project | Vercel | URL |
|---|---|---|---|
| Staging | `nesja-os-staging` | preview / `staging` branch | `staging.app.nesja.ai` |
| Production | `nesja-os-production` | production | `app.nesja.ai` |

The Infoline Commercial Hub database is never used. Both projects start empty.

## 1. Supabase (per environment)
1. Create the project (paid plan; region Frankfurt `eu-central-1` or Mumbai `ap-south-1`).
2. `npx supabase link --project-ref <ref>` then `npx supabase db push` (applies `supabase/migrations`).
3. Auth settings: site URL `https://app.nesja.ai`; redirect URLs `https://app.nesja.ai/**`; e-mail confirmations on; TOTP MFA on; minimum password length 12; custom SMTP for production volume.
4. Optional demo: `DEMO_TENANT_ID=… npx tsx scripts/generate-demo.ts --out northstar.sql` and run it with `psql`. Demo data stays in its own demo tenant.

## 2. Vercel
Project root `nesja-os`, framework Next.js, region `fra1`. Environment variables from `.env.example`
(`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL` = transaction pooler on port 6543, `DATABASE_CA_CERT`, `CRON_SECRET` are server-only).
`vercel.json` schedules `/api/jobs` every 15 minutes.

## 3. DNS (Cloudflare, nesja.ai)
Add `app` → `cname.vercel-dns.com` (DNS only) and, for staging, `staging.app`. `www.nesja.ai` is untouched.

## 4. Website Sign In
The marketing site already supports this; it is configuration only. In the **www** Vercel project set
`AUTH_PROVIDER=nesja-app` and `NEXT_PUBLIC_APP_URL=https://app.nesja.ai`. The header then shows "Sign In", and the
website's /login hands the e-mail to `app.nesja.ai/login?login_hint=…`. This changes production, so it needs approval.

## 5. Release checks (must pass before calling anything live)
- `curl -s https://app.nesja.ai/api/health` returns `{"ok":true,…}` with database reachable.
- Run `APP=https://staging.app.nesja.ai node scripts/e2e.mjs` against staging (needs a mail catcher, or adapt to real inboxes).
- Sign up, verify, create an organization, sign in with MFA on production by hand.
- `https://www.nesja.ai` still serves the website and its Sign In reaches `app.nesja.ai/login`.

## Needed from the owner
1. Network allow-list for this build environment: `api.supabase.com`, `*.supabase.co`, `api.vercel.com`, `api.cloudflare.com`, `nesja.ai`, `*.nesja.ai`.
2. Supabase access token + organization id, approval for two paid projects and the region.
3. Vercel token for the team.
4. Cloudflare token with DNS edit on nesja.ai, and approval for the `app` record.
5. Approval for the production release and the website Sign In change.
