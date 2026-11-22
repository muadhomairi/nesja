import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";
import { getSession, requireSession } from "@/lib/server/session";
import { many, withUser } from "@/lib/server/db";
import { ActionForm } from "@/components/forms/action-form";
import { Field, Input, Notice, Select, ButtonLink } from "@/components/ui/primitives";
import { Wordmark } from "@/components/shell/logo";
import { createOrgAction, inviteAction } from "@/app/actions/org";
import { configureAction, importAccountsAction } from "@/app/actions/onboarding";

const STEPS = [["organization", "Organization"], ["configure", "Configuration"], ["team", "Team"], ["import", "Data import"], ["subscription", "Subscription"], ["live", "Go live"]] as const;
export const metadata = { title: "Set up your organization" };

export default async function Onboarding({ searchParams }: { searchParams: Promise<{ step?: string }> }) {
  await requireSession();
  const s = (await getSession())!;
  const sp = await searchParams;
  const ownLive = s.org && s.org.kind !== "demo" ? s.org : null;
  const step = !ownLive ? "organization" : (STEPS.find(([k]) => k === sp.step)?.[0] ?? "configure");
  const plans = ownLive ? await withUser(s.userId, (db) => many<{ code: string; name: string; default_seats: number; price_status: string }>(db, "select code, name, default_seats, price_status from public.plans where code not in ('demo') order by default_seats")) : [];
  const sub = ownLive ? (await withUser(s.userId, (db) => many<{ plan_code: string; status: string; seats: number; trial_ends_at: string | null }>(db, "select plan_code, status, seats, trial_ends_at from public.subscriptions where tenant_id = $1", [ownLive.id])))[0] : null;
  const idx = STEPS.findIndex(([k]) => k === step);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Wordmark />
      <h1 className="page-title mt-8 text-2xl font-semibold">Set up NESJA Commercial</h1>
      <ol className="mt-6 flex flex-wrap gap-3 text-xs">
        {STEPS.map(([k, l], i) => <li key={k} className={`inline-flex items-center gap-1 ${i === idx ? "font-semibold text-fg" : "text-muted"}`}>{i < idx ? <CheckCircle2 className="h-4 w-4 text-ok" /> : <Circle className="h-4 w-4" />}{ownLive && i > 0 ? <Link href={`?step=${k}`}>{l}</Link> : l}</li>)}
      </ol>
      <div className="card mt-6 p-6">
        {step === "organization" && (
          <ActionForm action={createOrgAction} submit="Create organization" pending="Provisioning…">
            <p className="text-sm text-muted">Your organization gets its own isolated workspace, roles and data. You become its owner.</p>
            <Field label="Organization name" htmlFor="name"><Input id="name" name="name" required placeholder="Acme Services Ltd" /></Field>
            <Field label="Workspace address" htmlFor="slug" hint="Lowercase letters, numbers and dashes."><Input id="slug" name="slug" required pattern="[a-z0-9][a-z0-9-]{1,62}" placeholder="acme-services" /></Field>
            <Field label="Base currency" htmlFor="currency"><Select id="currency" name="currency" defaultValue="USD">{["USD", "EUR", "GBP", "AED", "SAR", "OMR", "INR", "SGD"].map((c) => <option key={c}>{c}</option>)}</Select></Field>
          </ActionForm>
        )}
        {step === "configure" && (
          <ActionForm action={configureAction} submit="Save and continue">
            <Field label="Business units" htmlFor="units" hint="One per line. Used for team-level visibility and reporting."><textarea id="units" name="units" rows={4} className="w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm" placeholder={"North America\nEMEA"} /></Field>
            <Field label="Target gross margin (%)" htmlFor="target_margin" hint="Quotes below this margin are flagged for approval."><Input id="target_margin" name="target_margin" type="number" min={0} max={90} step="0.5" defaultValue={25} /></Field>
            <Field label="Time zone" htmlFor="time_zone"><Input id="time_zone" name="time_zone" defaultValue="UTC" /></Field>
          </ActionForm>
        )}
        {step === "team" && (<>
          <ActionForm action={inviteAction} submit="Send invitation">
            <Field label="Colleague's e-mail" htmlFor="email"><Input id="email" name="email" type="email" required /></Field>
            <Field label="Role" htmlFor="role"><Select id="role" name="role" defaultValue="account_manager">
              {[["admin", "Administrator"], ["executive", "Executive"], ["sales_manager", "Sales Manager"], ["account_manager", "Account Manager"], ["bid_manager", "Bid Manager"], ["finance", "Finance"], ["viewer", "Viewer"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </Select></Field>
          </ActionForm>
          <p className="mt-4 text-end text-sm"><Link href="?step=import" className="text-link hover:underline">Continue →</Link></p>
        </>)}
        {step === "import" && (<>
          <ActionForm action={importAccountsAction} submit="Import accounts">
            <p className="text-sm text-muted">Upload a CSV with the header <code>number,name,industry,country</code>. Every row is checked first; if one fails, nothing is saved.</p>
            <input type="file" name="file" accept=".csv,text/csv" className="text-sm" required />
          </ActionForm>
          <p className="mt-4 text-end text-sm"><Link href="?step=subscription" className="text-link hover:underline">Skip for now →</Link></p>
        </>)}
        {step === "subscription" && (<div className="space-y-4">
          <Notice tone="info">You are on a free trial{sub?.trial_ends_at ? ` until ${new Date(sub.trial_ends_at).toLocaleDateString("en-GB", { timeZone: "UTC" })}` : ""} with {sub?.seats ?? 5} seats. Paid plans open once NESJA publishes its commercial terms; no payment is taken in this version.</Notice>
          <div className="grid gap-3 sm:grid-cols-3">{plans.filter((p) => p.code !== "trial").map((p) => <div key={p.code} className="rounded-lg border border-line p-4"><p className="font-semibold">{p.name}</p><p className="text-xs text-muted">From {p.default_seats} seats</p><p className="mt-2 text-xs text-subtle">{p.price_status === "approved" ? "" : "Pricing to be confirmed"}</p></div>)}</div>
          <p className="text-end text-sm"><Link href="?step=live" className="text-link hover:underline">Continue →</Link></p>
        </div>)}
        {step === "live" && (<div className="space-y-4">
          <p className="text-sm">Your workspace is ready. Start with the command center, or add your first opportunity.</p>
          <div className="flex gap-2"><ButtonLink href="/commercial">Open NESJA Commercial</ButtonLink><ButtonLink href="/commercial/opportunities/new" variant="secondary">New opportunity</ButtonLink></div>
        </div>)}
      </div>
    </div>
  );
}
