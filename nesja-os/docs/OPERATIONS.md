# Operations

## Scheduled jobs
`/api/jobs` (Vercel Cron, every 15 minutes, `Authorization: Bearer $CRON_SECRET`) runs queued rows from `public.jobs`:
- `demo_user_expire`: removes throwaway demo visitors after 24 hours.
- `tenant_delete`: deletes a tenant 14 days after an owner requests it. Until then a platform admin can cancel it by setting the job's status to `cancelled` (no UI for this yet).
- `tenant_export`: **not implemented yet**; the job fails visibly rather than pretending. Owners can use CSV exports meanwhile.

## Health and monitoring
`GET /api/health` checks the database. Point an uptime monitor at it. Vercel logs carry server errors; no third-party
error tracker is configured yet.

## Backups
Supabase daily backups on paid plans; enable Point-in-Time Recovery for production. Test a restore into staging before launch.

## Migrations
Forward-only SQL files in `supabase/migrations`, applied with `supabase db push`. Run `npm run test:db` before every push.
Write each migration so it can be applied to staging first.

## Rollback
- **App:** Vercel → Deployments → promote the previous production deployment (instant).
- **Database:** write a new forward migration that reverts the change; for data loss, restore with PITR into a new project and repoint `DATABASE_URL`.
- **Website Sign In:** remove `AUTH_PROVIDER` / `NEXT_PUBLIC_APP_URL` in the www project and redeploy; the header falls back to "Talk to Sales".
- **DNS:** delete the `app` record; www is unaffected.

## Tenant lifecycle
Platform admins (`profiles.is_platform_admin`, set by hand in SQL) can suspend or reactivate a tenant from `/admin/platform`. Suspended tenants
lose access through RLS immediately, because `private.is_member` requires a trial or active tenant.
