import Link from "next/link";
import type { ReactNode } from "react";
import * as I from "lucide-react";
import { Wordmark } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { OrgSwitcher } from "./org-switcher";
import type { Session } from "@/lib/server/session";
import { getT, type TKey } from "@/lib/i18n";
import { RELEASE } from "@/design-system/version";

type Item = { href: string; key: TKey; icon: keyof typeof I; perm?: string };
const NAV: { group: TKey; items: Item[] }[] = [
  { group: "group.sell", items: [
    { href: "/commercial", key: "nav.home", icon: "Gauge", perm: "report.view" },
    { href: "/commercial/accounts", key: "nav.accounts", icon: "Building2", perm: "account.view" },
    { href: "/commercial/leads", key: "nav.leads", icon: "Magnet", perm: "lead.view" },
    { href: "/commercial/opportunities", key: "nav.opportunities", icon: "Target", perm: "opportunity.view" },
    { href: "/commercial/activities", key: "nav.activities", icon: "CalendarCheck", perm: "activity.view" } ] },
  { group: "group.price", items: [
    { href: "/commercial/quotes", key: "nav.quotes", icon: "Calculator", perm: "quote.view" },
    { href: "/commercial/costing", key: "nav.costing", icon: "UsersRound", perm: "costing.view" },
    { href: "/commercial/tenders", key: "nav.tenders", icon: "Gavel", perm: "tender.view" },
    { href: "/commercial/approvals", key: "nav.approvals", icon: "BadgeCheck", perm: "approval.view" } ] },
  { group: "group.contract", items: [
    { href: "/commercial/agreements", key: "nav.agreements", icon: "FileSignature", perm: "agreement.view" },
    { href: "/commercial/renewals", key: "nav.renewals", icon: "RefreshCcw", perm: "renewal.view" },
    { href: "/commercial/documents", key: "nav.documents", icon: "FolderOpen", perm: "document.view" } ] },
  { group: "group.insight", items: [
    { href: "/commercial/performance", key: "nav.performance", icon: "ChartColumn", perm: "finance.view" },
    { href: "/commercial/forecast", key: "nav.forecast", icon: "TrendingUp", perm: "report.view" },
    { href: "/commercial/data-quality", key: "nav.quality", icon: "ShieldCheck", perm: "report.view" },
    { href: "/commercial/assistant", key: "nav.assistant", icon: "Sparkles", perm: "ai.use" } ] },
  { group: "group.org", items: [
    { href: "/admin", key: "nav.admin", icon: "Settings2", perm: "admin.users" },
    { href: "/admin/integrations", key: "nav.integrations", icon: "Plug", perm: "admin.org" },
    { href: "/launcher", key: "nav.launcher", icon: "LayoutGrid" } ] },
];

function Icon({ name }: { name: keyof typeof I }) {
  const C = I[name] as React.ComponentType<{ className?: string }>;
  return <C className="h-4 w-4 shrink-0" />;
}

export async function AppShell({ session, children, unread = 0 }: { session: Session; children: ReactNode; unread?: number }) {
  const t = await getT();
  const demo = session.org?.kind === "demo";
  const navBody = (<>
          {NAV.map((g) => {
            const items = g.items.filter((i) => !i.perm || session.can(i.perm));
            if (!items.length) return null;
            return (
              <div key={g.group}>
                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-subtle">{t(g.group)}</p>
                {items.map((i) => <Link key={i.href} href={i.href} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted hover:bg-hover hover:text-fg"><Icon name={i.icon} />{t(i.key)}</Link>)}
                {g.group === "group.sell" && demo && <Link href="/demo/journeys" className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted hover:bg-hover hover:text-fg"><Icon name="Route" />{t("nav.demo")}</Link>}
              </div>
            );
          })}
        </>);
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-e border-line bg-surface lg:flex" aria-label="Main navigation">
        <div className="px-4 py-4"><Link href="/launcher"><Wordmark product="Commercial" /></Link></div>
        <nav className="flex-1 space-y-4 overflow-y-auto px-2 pb-4">{navBody}</nav>
        <p className="border-t border-line px-4 py-2 text-[10px] text-subtle">{RELEASE.product} {RELEASE.version}</p>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {demo && <div className="bg-brand-500 px-4 py-1.5 text-center text-xs font-semibold text-on-brand">Demonstration environment · all companies, people and figures are fictional (USD)</div>}
        <header className="sticky top-0 z-10 flex items-center gap-2 border-b border-line bg-surface/90 px-4 py-2 backdrop-blur">
          <details className="relative lg:hidden">
            <summary className="list-none rounded-lg p-2 text-muted hover:bg-hover" aria-label="Open navigation"><I.Menu className="h-5 w-5" /></summary>
            <nav className="absolute start-0 top-11 z-20 max-h-[80vh] w-64 space-y-4 overflow-y-auto rounded-xl border border-line bg-surface p-2 shadow-lg">{navBody}</nav>
          </details>
          <Link href="/launcher" className="lg:hidden"><Wordmark /></Link>
          <form action="/commercial/search" className="hidden max-w-md flex-1 md:block">
            <label className="sr-only" htmlFor="q">Search</label>
            <input id="q" name="q" placeholder="Search accounts, opportunities, quotes…" className="w-full rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-sm outline-none focus:border-focus" />
          </form>
          <div className="ms-auto flex items-center gap-1">
            <OrgSwitcher orgs={session.orgs.map((o) => ({ id: o.id, name: o.name, kind: o.kind }))} current={session.org?.id ?? null} />
            <Link href="/commercial/notifications" className="relative rounded-lg p-2 text-muted hover:bg-hover" aria-label={`Notifications, ${unread} unread`}>
              <I.Bell className="h-4 w-4" />{unread > 0 && <span className="absolute end-1 top-1 h-2 w-2 rounded-full bg-bad" />}
            </Link>
            <ThemeToggle />
            <Link href="/account" className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm hover:bg-hover">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-500 text-xs font-bold text-on-brand">{(session.fullName ?? session.email).slice(0, 1).toUpperCase()}</span>
              <span className="hidden text-start leading-tight sm:block"><span className="block text-xs font-semibold">{session.fullName ?? session.email}</span><span className="block text-[11px] text-muted">{session.org?.role_name}</span></span>
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
