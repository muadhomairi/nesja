/** Illustrative product screens for each step of the commercial journey. */
import type { JourneyView } from "@/content/journey";
import { Icon } from "@/components/ui/Icon";
import { Chip, Label, Panel } from "./AppFrame";
import { cn } from "@/lib/cn";

const Row = ({ a, b, strong }: { a: string; b: string; strong?: boolean }) => (
  <div className={cn("flex justify-between py-1.5 text-xs", strong ? "font-semibold text-cloud" : "text-silver")}><span>{a}</span><span className="tabular-nums">{b}</span></div>
);

function Lead() {
  const leads = [
    { n: "Meridian Freight", p: "Demo request", s: "LinkedIn · Q4 Ops campaign", tone: "teal" as const, isNew: true },
    { n: "Helix Health Group", p: "Pricing page", s: "Organic search", tone: "neutral" as const },
    { n: "Atlas Utilities", p: "Webinar", s: "Email · Commercial OS series", tone: "neutral" as const },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><p className="text-sm font-semibold text-cloud">Inbound leads</p><Chip tone="teal">3 new today</Chip></div>
      {leads.map((l) => (
        <Panel key={l.n} className={cn(l.isNew && "border-teal/40 bg-teal/[0.06]")}>
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-sm font-semibold text-cloud">{l.n}</p><p className="mt-0.5 text-xs text-mist">{l.s}</p></div>
            <Chip tone={l.tone}>{l.p}</Chip>
          </div>
          {l.isNew && <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-silver"><Icon name="users" className="h-3.5 w-3.5 text-teal" /> Routed to Sara K. · Enterprise · GCC territory</div>}
        </Panel>
      ))}
    </div>
  );
}

function Opportunity() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2"><div><Label>Opportunity</Label><p className="text-base font-semibold text-cloud">Meridian Freight — Fleet commercial platform</p></div><Chip tone="signal">Qualification</Chip></div>
      <div className="grid grid-cols-3 gap-2">
        {[["Value", "$186,000"], ["Close", "Q1"], ["Probability", "30%"]].map(([k, v]) => <Panel key={k}><Label>{k}</Label><p className="mt-1 text-sm font-semibold text-cloud">{v}</p></Panel>)}
      </div>
      <Panel><Label>Buying group</Label>
        <ul className="mt-2 space-y-1.5 text-xs text-silver">
          {[["Omar H.", "Chief Commercial Officer", "Decision maker"], ["Lina R.", "Head of Sales Ops", "Champion"], ["David P.", "CFO", "Approver"]].map(([n, r, t]) => <li key={n} className="flex justify-between"><span><span className="font-medium text-cloud">{n}</span> · {r}</span><Chip>{t}</Chip></li>)}
        </ul>
      </Panel>
      <Panel className="flex items-center gap-2 text-xs text-silver"><Icon name="check" className="h-4 w-4 text-teal" /> Lead history, campaign source and notes carried over</Panel>
    </div>
  );
}

function Pipeline() {
  const cols = [
    { t: "Qualify", d: [["Helix Health", "$64k"], ["Atlas Utilities", "$120k"]] },
    { t: "Solution", d: [["Meridian Freight", "$186k"]], hl: 0 },
    { t: "Proposal", d: [["Orion Telecom", "$310k"], ["Crescent Bank", "$95k"]] },
    { t: "Negotiate", d: [["Summit Retail", "$72k"]] },
  ];
  return (
    <div>
      <div className="mb-3 flex items-center justify-between"><p className="text-sm font-semibold text-cloud">Enterprise pipeline</p><Chip>$847k open</Chip></div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {cols.map((c) => (
          <div key={c.t} className="rounded-xl bg-white/[0.025] p-2">
            <p className="mb-2 px-1 text-[0.6875rem] font-semibold uppercase tracking-wider text-mist">{c.t}</p>
            <div className="space-y-2">
              {c.d.map(([n, v], i) => (
                <div key={n} className={cn("rounded-lg border p-2.5", c.hl === i ? "animate-fade-up border-teal/50 bg-teal/[0.08]" : "border-white/[0.07] bg-midnight-800")}>
                  <p className="text-xs font-semibold text-cloud">{n}</p><p className="mt-1 text-[0.6875rem] text-mist">{v}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-silver"><Icon name="check" className="h-3.5 w-3.5 text-teal" /> Stage exit criteria met: discovery, budget, decision process</p>
    </div>
  );
}

function Bundle() {
  const items = [
    { n: "Fleet Commercial Suite", d: "Core platform · 120 users", on: true },
    { n: "Route Quote add-on", d: "Requires Fleet Commercial Suite", on: true },
    { n: "Premium onboarding", d: "8-week programme", on: true },
    { n: "On-site training", d: "Optional", on: false },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><p className="text-sm font-semibold text-cloud">Configure solution</p><Chip tone="teal">Valid configuration</Chip></div>
      {items.map((i) => (
        <Panel key={i.n} className="flex items-center justify-between gap-3">
          <div><p className="text-sm font-medium text-cloud">{i.n}</p><p className="text-xs text-mist">{i.d}</p></div>
          <span className={cn("relative h-5 w-9 rounded-full", i.on ? "bg-teal" : "bg-white/15")}><span className={cn("absolute top-0.5 h-4 w-4 rounded-full bg-cloud", i.on ? "end-0.5" : "start-0.5")} /></span>
        </Panel>
      ))}
      <p className="flex items-center gap-1.5 text-xs text-silver"><Icon name="info" className="h-3.5 w-3.5 text-signal-soft" /> Rule applied: Route Quote requires the core suite</p>
    </div>
  );
}

function Quote() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><div><Label>Quotation Q-2041</Label><p className="text-sm font-semibold text-cloud">Meridian Freight</p></div><Chip tone="signal">Draft</Chip></div>
      <Panel>
        <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 border-b border-white/[0.06] pb-2 text-[0.6875rem] uppercase tracking-wider text-mist"><span>Item</span><span>Qty</span><span>Total</span></div>
        {[["Fleet Commercial Suite", "120", "$129,600"], ["Route Quote add-on", "120", "$34,560"], ["Premium onboarding", "1", "$28,000"]].map(([a, q, t]) => (
          <div key={a} className="grid grid-cols-[1fr_auto_auto] gap-x-4 py-1.5 text-xs text-silver"><span>{a}</span><span className="tabular-nums">{q}</span><span className="tabular-nums">{t}</span></div>
        ))}
        <div className="mt-2 border-t border-white/[0.06] pt-2"><Row a="Subtotal" b="$192,160" /><Row a="Discount (12%)" b="−$23,059" /><Row a="Total (24 months)" b="$169,101" strong /></div>
      </Panel>
      <div className="flex gap-2"><Chip tone="amber">Discount above 10% policy</Chip><Chip>Margin 61%</Chip></div>
    </div>
  );
}

function Approval() {
  const steps = [["Sales manager", "Approved", "teal"], ["Commercial director", "Approved", "teal"], ["Finance", "Awaiting review", "amber"], ["Legal", "Not required", "neutral"]] as const;
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-cloud">Approval: Q-2041 discount 12%</p>
      <ol className="space-y-2">
        {steps.map(([who, st, tone], i) => (
          <li key={who}><Panel className="flex items-center justify-between">
            <span className="flex items-center gap-3 text-sm text-cloud"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.06] text-xs text-mist">{i + 1}</span>{who}</span>
            <Chip tone={tone}>{st}</Chip>
          </Panel></li>
        ))}
      </ol>
      <Panel className="text-xs text-silver"><span className="font-medium text-cloud">Policy:</span> discounts above 10% need finance approval. Margin impact is shown to every approver.</Panel>
    </div>
  );
}

function Contract() {
  return (
    <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
      <Panel className="space-y-2">
        <Label>Master services agreement</Label>
        <p className="text-sm font-semibold text-cloud">Meridian Freight · 24 months</p>
        {[80, 95, 70, 88, 60].map((w, i) => <div key={i} className="h-1.5 rounded bg-white/[0.07]" style={{ width: `${w}%` }} />)}
        <p className="pt-2 text-xs text-mist">Generated from accepted quote Q-2041</p>
      </Panel>
      <div className="space-y-2">
        <Label>Obligations & milestones</Label>
        {[["Go-live", "Week 8", "signal"], ["Quarterly business review", "Every 90 days", "neutral"], ["Renewal notice", "90 days before end", "amber"]].map(([a, b, t]) => (
          <Panel key={a} className="flex items-center justify-between py-2.5"><span className="text-xs text-cloud">{a}</span><Chip tone={t as "signal"}>{b}</Chip></Panel>
        ))}
      </div>
    </div>
  );
}

function Comms() {
  const items = [["mail", "Proposal sent to Omar H.", "Opened 3 times", "Tue"], ["video", "Solution workshop", "6 attendees · notes logged", "Wed"], ["mail", "Contract redlines from legal", "Attached to agreement v2", "Thu"], ["engage", "Follow-up scheduled", "Lina R. · next Monday", "Fri"]];
  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-cloud">Activity · Meridian Freight</p>
      <ol className="relative space-y-3 border-s border-white/[0.08] ps-5">
        {items.map(([icon, t, d, day]) => (
          <li key={t} className="relative">
            <span className="absolute -start-[1.85rem] top-0.5 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-midnight-800"><Icon name={icon} className="h-3.5 w-3.5 text-teal" /></span>
            <div className="flex justify-between gap-2"><p className="text-sm text-cloud">{t}</p><span className="text-xs text-mist">{day}</span></div>
            <p className="text-xs text-mist">{d}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Active() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between"><div><Label>Account</Label><p className="text-base font-semibold text-cloud">Meridian Freight</p></div><Chip tone="teal">Active customer</Chip></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[["Contract value", "$169k"], ["Term", "24 mo"], ["Users", "120"], ["Renewal", "In 24 mo"]].map(([k, v]) => <Panel key={k}><Label>{k}</Label><p className="mt-1 text-sm font-semibold text-cloud">{v}</p></Panel>)}
      </div>
      <Panel><Label>Commercial story</Label>
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[0.6875rem] text-silver">
          {["Campaign", "Lead", "Opportunity", "Quote", "Approval", "Contract", "Customer"].map((s, i, a) => <span key={s} className="flex items-center gap-1.5"><Chip tone={i === a.length - 1 ? "teal" : "neutral"}>{s}</Chip>{i < a.length - 1 && <Icon name="chevronRight" className="h-3 w-3 text-mist rtl:-scale-x-100" />}</span>)}
        </div>
      </Panel>
    </div>
  );
}

function Success() {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_0.8fr]">
      <Panel>
        <Label>Handoff to Customer Success</Label>
        <ul className="mt-2 space-y-2 text-xs text-silver">
          {["Stakeholders and roles transferred", "Success criteria from discovery", "Contract obligations and milestones", "Commercial terms and renewal date"].map((x) => <li key={x} className="flex gap-2"><Icon name="check" className="h-3.5 w-3.5 shrink-0 text-teal" />{x}</li>)}
        </ul>
        <p className="mt-3 text-xs text-mist">Owner: Rami A. · Customer Success</p>
      </Panel>
      <Panel className="flex flex-col items-center justify-center text-center">
        <Label>Customer health</Label>
        <svg viewBox="0 0 100 60" className="mt-2 w-32" aria-hidden="true"><path d="M10 55 A40 40 0 0 1 90 55" stroke="rgb(255 255 255 / .08)" strokeWidth="8" fill="none" strokeLinecap="round" /><path d="M10 55 A40 40 0 0 1 78 25" stroke="rgb(var(--teal))" strokeWidth="8" fill="none" strokeLinecap="round" /></svg>
        <p className="-mt-3 text-xl font-semibold text-cloud">82</p><p className="text-xs text-teal-soft">Healthy · onboarding on track</p>
      </Panel>
    </div>
  );
}

function Dashboard() {
  const bars = [42, 55, 48, 63, 71, 66, 80, 86];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {[["Bookings QTD", "$2.4M", "+18%"], ["Pipeline", "$9.1M", "3.8× cover"], ["Win rate", "31%", "+4 pts"], ["Net retention", "112%", "Trailing 12m"]].map(([k, v, d]) => <Panel key={k}><Label>{k}</Label><p className="mt-1 text-lg font-semibold text-cloud">{v}</p><p className="text-[0.6875rem] text-teal-soft">{d}</p></Panel>)}
      </div>
      <Panel>
        <div className="flex items-center justify-between"><Label>Bookings vs forecast</Label><Chip tone="signal">Updated just now</Chip></div>
        <div className="mt-3 flex h-28 items-end gap-2">
          {bars.map((h, i) => <div key={i} className="flex-1 rounded-t bg-gradient-to-t from-signal/40 to-teal/80" style={{ height: `${h}%` }} />)}
        </div>
      </Panel>
    </div>
  );
}

function Ai() {
  const items = [
    { t: "Orion Telecom: deal at risk", d: "No contact with the economic buyer in 21 days. Proposal is waiting on finance approval.", a: "Request approval and book an executive call", tone: "rose" as const },
    { t: "Crescent Bank: pricing anomaly", d: "Discount is 9 points above similar deals in this segment.", a: "Review with deal desk", tone: "amber" as const },
    { t: "Meridian Freight: expansion signal", d: "Usage across 3 new depots. Contract allows add-on sites.", a: "Create expansion opportunity", tone: "teal" as const },
  ];
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2"><Icon name="sparkle" className="h-4 w-4 text-signal-soft" /><p className="text-sm font-semibold text-cloud">NESJA AI · Today&apos;s priorities</p></div>
      {items.map((i) => (
        <Panel key={i.t}>
          <div className="flex items-start justify-between gap-2"><p className="text-sm font-semibold text-cloud">{i.t}</p><Chip tone={i.tone}>{i.tone === "rose" ? "Risk" : i.tone === "amber" ? "Anomaly" : "Opportunity"}</Chip></div>
          <p className="mt-1 text-xs leading-relaxed text-mist">{i.d}</p>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-teal-soft"><Icon name="arrowRight" className="h-3.5 w-3.5 rtl:-scale-x-100" /> {i.a}</p>
        </Panel>
      ))}
    </div>
  );
}

export const journeyViews: Record<JourneyView, () => React.ReactElement> = {
  lead: Lead, opportunity: Opportunity, pipeline: Pipeline, bundle: Bundle, quote: Quote, approval: Approval,
  contract: Contract, comms: Comms, active: Active, success: Success, dashboard: Dashboard, ai: Ai,
};

/** Representative screen for each module page. */
export const moduleViews: Record<string, JourneyView> = {
  pipeline: "pipeline", accounts: "active", quote: "quote", contracts: "contract", engage: "comms", success: "success", intelligence: "dashboard", ai: "ai",
};
