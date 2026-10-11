"use client";
/**
 * Interactive system map: NESJA.OS at the centre, modules orbiting it.
 * Positions are computed from the module list, so adding a module to
 * src/config/modules.ts places it on the map automatically.
 */
import Link from "next/link";
import { useState } from "react";
import { modules } from "@/config/modules";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const R = 40; // radius in % of the square stage

export function SystemMap() {
  const [active, setActive] = useState(modules[0].slug);
  const current = modules.find((m) => m.slug === active)!;
  const pos = modules.map((m, i) => {
    const a = (i / modules.length) * Math.PI * 2 - Math.PI / 2;
    return { slug: m.slug, x: 50 + R * Math.cos(a), y: 50 + R * Math.sin(a) };
  });
  const p = (slug: string) => pos.find((q) => q.slug === slug)!;
  const select = (slug: string) => { setActive(slug); track("platform_explored", { location: `system-map:${slug}` }); };

  return (
    <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
      {/* Stage (tablet/desktop) */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-[600px] md:block">
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgb(var(--silver) / 0.08)" strokeWidth="0.25" />
          <circle cx="50" cy="50" r={R - 14} fill="none" stroke="rgb(var(--silver) / 0.05)" strokeWidth="0.25" strokeDasharray="0.6 1.2" />
          {pos.map((q) => (
            <line key={q.slug} x1="50" y1="50" x2={q.x} y2={q.y} stroke={q.slug === active ? "rgb(var(--teal))" : "rgb(var(--silver) / 0.12)"} strokeWidth={q.slug === active ? 0.45 : 0.25} className={q.slug === active ? "flow-dash" : ""} style={{ transition: "stroke 300ms" }} />
          ))}
          {current.connectsTo.map((to) => (
            <path key={to} d={`M ${p(active).x} ${p(active).y} Q 50 50 ${p(to).x} ${p(to).y}`} fill="none" stroke="rgb(var(--signal) / 0.65)" strokeWidth="0.3" strokeDasharray="0.8 1" />
          ))}
        </svg>
        <div className="absolute left-1/2 top-1/2 flex h-[26%] w-[26%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-[28%] border border-teal/50 bg-gradient-to-br from-midnight-700 to-midnight-800 text-center shadow-glow">
          <span className="text-lg font-bold tracking-wider text-cloud">NESJA<span className="text-teal">.OS</span></span>
          <span className="mt-1 text-[0.65rem] uppercase tracking-[0.18em] text-mist">Core</span>
        </div>
        <ul aria-label="NESJA modules">
          {modules.map((m) => {
            const q = p(m.slug);
            const isActive = m.slug === active;
            const related = current.connectsTo.includes(m.slug);
            return (
              <li key={m.slug} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${q.x}%`, top: `${q.y}%` }}>
                <button type="button" onClick={() => select(m.slug)} onMouseEnter={() => setActive(m.slug)} onFocus={() => setActive(m.slug)} aria-pressed={isActive}
                  className={cn("flex w-[8.5rem] flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-center transition-all duration-300",
                    isActive ? "border-teal/60 bg-midnight-700 shadow-glow" : related ? "border-signal/40 bg-midnight-800" : "border-white/[0.08] bg-midnight-800/80 hover:border-white/20")}>
                  <Icon name={m.icon} className={cn("h-5 w-5", isActive ? "text-teal" : related ? "text-signal-soft" : "text-silver")} />
                  <span className="text-[0.8125rem] font-semibold leading-tight text-cloud">{m.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Mobile grid */}
      <div className="md:hidden">
        <div className="mb-4 rounded-2xl border border-teal/50 bg-midnight-800 p-5 text-center shadow-glow">
          <span className="text-lg font-bold tracking-wider text-cloud">NESJA<span className="text-teal">.OS</span></span>
          <p className="mt-1 text-xs text-mist">Every module runs on one core</p>
        </div>
        <ul className="grid grid-cols-2 gap-2" aria-label="NESJA modules">
          {modules.map((m) => (
            <li key={m.slug}>
              <button type="button" onClick={() => select(m.slug)} aria-pressed={m.slug === active}
                className={cn("flex w-full items-center gap-2 rounded-xl border px-3 py-3 text-start text-sm font-semibold transition-colors", m.slug === active ? "border-teal/60 bg-midnight-700 text-cloud" : "border-white/[0.08] bg-midnight-800/70 text-silver")}>
                <Icon name={m.icon} className="h-4 w-4 shrink-0 text-teal" /> {m.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Detail */}
      <div aria-live="polite" className="surface p-7 md:p-8">
        <p className="eyebrow text-[0.7rem]">{current.summary}</p>
        <h3 className="mt-3 text-2xl font-semibold text-cloud">{current.name}</h3>
        <p className="mt-3 leading-relaxed text-mist">{current.intro}</p>
        <ul className="mt-5 space-y-2">
          {current.outcomes.map((o) => <li key={o} className="flex gap-2 text-sm text-silver"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-teal" />{o}</li>)}
        </ul>
        <p className="mt-6 text-xs font-medium uppercase tracking-[0.14em] text-mist">Connects to</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {current.connectsTo.map((s) => <li key={s}><button type="button" onClick={() => select(s)} className="rounded-full border border-signal/30 bg-signal/10 px-2.5 py-1 text-xs text-signal-soft hover:border-signal/60">{modules.find((m) => m.slug === s)?.label}</button></li>)}
        </ul>
        <Link href={`/platform/${current.slug}`} className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:text-teal-soft">
          Explore {current.name} <Icon name="arrowRight" className="h-4 w-4 rtl:-scale-x-100" />
        </Link>
      </div>
    </div>
  );
}
