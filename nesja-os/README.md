# NESJA.OS Commercial 1.0.0

Multi-tenant commercial platform for services companies, served at `app.nesja.ai`. Next.js 16 (App Router) on Vercel,
Supabase (Postgres with row-level security, Auth with TOTP MFA, Storage).

**Status:** built and verified against a local Supabase stack. **Not deployed.** No staging or production Supabase project,
Vercel project or DNS record exists yet; see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

| | |
|---|---|
| Database & security model | [docs/SECURITY.md](docs/SECURITY.md) |
| Deploy, environments, release | [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) |
| Jobs, monitoring, backup, rollback | [docs/OPERATIONS.md](docs/OPERATIONS.md) |
| Feature parity with the Commercial Hub reference | [docs/FEATURE-PARITY.md](docs/FEATURE-PARITY.md) |

## Run locally
```bash
npm ci
npx supabase start                      # local Postgres, Auth, Storage, Mailpit (127.0.0.1:54324)
npx tsx scripts/generate-demo.ts --out /tmp/northstar.sql && psql "$LOCAL_DB_URL" -f /tmp/northstar.sql
cp .env.example .env.local              # fill in the values `supabase status` prints
npm run build && npm start              # http://localhost:3100
```

## Tests
| Command | What it checks |
|---|---|
| `npm test` | Decimal finance engine (pricing, costing, amortisation) and CSV safety |
| `npm run test:db` | Every migration on a throwaway PostgreSQL, 82 checks: tenant isolation, RLS scopes, segregation of duties, quote locking, append-only audit, storage paths, demo reconciliation, forecast and data-quality views |
| `node scripts/e2e.mjs [shots]` | Browser journey against a running app + local Supabase (46 checks): sign-up, verification, onboarding, invite, CPQ, approval, close won, exports, demo |
| `npm run typecheck` | TypeScript |
