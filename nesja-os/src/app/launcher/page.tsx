import Link from "next/link";
import { ArrowUpRight, Briefcase, Headset, Truck } from "lucide-react";
import { requireSession } from "@/lib/server/session";
import { Badge } from "@/components/ui/primitives";
import { Wordmark } from "@/components/shell/logo";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { OrgSwitcher } from "@/components/shell/org-switcher";
import { env } from "@/lib/env";

export const metadata = { title: "NESJA platform" };
export default async function Launcher() {
  const s = await requireSession();
  if (!s.orgs.length) return (await import("next/navigation")).redirect("/onboarding");
  const engageUrl = env.engageUrl();
  const products = [
    { key: "commercial", name: "NESJA Commercial", desc: "CRM, pipeline, CPQ and costing, tenders, agreements, renewals and MIS.", Icon: Briefcase,
      href: "/commercial", state: s.entitlements.commercial ? { tone: "ok" as const, text: "Available" } : { tone: "neutral" as const, text: "Not in your plan" }, enabled: !!s.entitlements.commercial },
    { key: "engage", name: "NESJA Engage", desc: "Omnichannel contact centre, QA, workforce and conversation intelligence.", Icon: Headset,
      href: engageUrl ? "/engage" : undefined, state: engageUrl ? { tone: "info" as const, text: "Opens Engage" } : { tone: "warn" as const, text: "Not deployed yet" }, enabled: !!engageUrl },
    { key: "deliver", name: "NESJA Deliver", desc: "Service delivery and operations.", Icon: Truck, href: undefined, state: { tone: "neutral" as const, text: "Coming soon" }, enabled: false },
  ];
  return (
    <div className="min-h-screen">
      <header className="flex items-center gap-2 border-b border-line bg-surface px-6 py-3">
        <Wordmark />
        <div className="ms-auto flex items-center gap-2">
          <OrgSwitcher orgs={s.orgs.map((o) => ({ id: o.id, name: o.name, kind: o.kind }))} current={s.org?.id ?? null} />
          <ThemeToggle />
          <form action="/auth/signout" method="post"><button className="rounded-lg px-3 py-1.5 text-sm text-muted hover:bg-hover">Sign out</button></form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="text-sm text-muted">{s.org?.name}{s.org?.kind === "demo" ? " · demonstration" : ""}</p>
        <h1 className="page-title mt-1 text-3xl font-semibold tracking-tight">Welcome{s.fullName ? `, ${s.fullName.split(" ")[0]}` : ""}</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {products.map(({ key, name, desc, Icon, href, state, enabled }) => {
            const body = (
              <div className={`card flex h-full flex-col p-5 ${enabled ? "hover:border-brand-500" : "opacity-75"}`}>
                <div className="flex items-center gap-2"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-100"><Icon className="h-5 w-5" /></span>
                  <span className="ms-auto"><Badge tone={state.tone}>{state.text}</Badge></span></div>
                <h2 className="mt-4 font-display text-lg font-semibold">{name}</h2>
                <p className="mt-1 flex-1 text-sm text-muted">{desc}</p>
                {enabled && <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-link">Open <ArrowUpRight className="h-4 w-4" /></span>}
              </div>
            );
            return enabled && href ? <Link key={key} href={href}>{body}</Link> : <div key={key} aria-disabled>{body}</div>;
          })}
        </div>
        {s.can("admin.users") && <p className="mt-8 text-sm"><Link href="/admin" className="text-link hover:underline">Organization administration</Link>{s.isPlatformAdmin && <> · <Link href="/admin/platform" className="text-link hover:underline">Platform administration</Link></>}</p>}
      </main>
    </div>
  );
}
