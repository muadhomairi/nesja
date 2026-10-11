/**
 * Product UI frame used by the journey and module pages. All data inside
 * mockups is illustrative sample data and is labelled as such.
 */
import type { ReactNode } from "react";
import { modules } from "@/config/modules";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function AppFrame({ activeModule, title, children, className }: { activeModule: string; title: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-white/[0.09] bg-midnight-900 shadow-panel", className)}>
      <div className="flex items-center gap-3 border-b border-white/[0.06] bg-midnight-800/80 px-4 py-2.5">
        <div className="flex gap-1.5" aria-hidden="true"><span className="h-2.5 w-2.5 rounded-full bg-white/15" /><span className="h-2.5 w-2.5 rounded-full bg-white/15" /><span className="h-2.5 w-2.5 rounded-full bg-white/15" /></div>
        <div className="flex-1 truncate text-center text-xs text-mist">app.nesja.os / {title}</div>
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[0.625rem] uppercase tracking-wider text-mist">Sample data</span>
      </div>
      <div className="flex min-h-[380px]">
        <nav aria-hidden="true" className="hidden w-[3.25rem] shrink-0 flex-col items-center gap-1 border-e border-white/[0.06] bg-midnight-800/40 py-3 sm:flex">
          {modules.map((m) => (
            <span key={m.slug} className={cn("flex h-9 w-9 items-center justify-center rounded-lg", m.slug === activeModule ? "bg-teal/15 text-teal" : "text-mist/70")}>
              <Icon name={m.icon} className="h-[1.1rem] w-[1.1rem]" />
            </span>
          ))}
        </nav>
        <div className="min-w-0 flex-1 p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

export const Chip = ({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "teal" | "signal" | "amber" | "rose" }) => {
  const t = { neutral: "bg-white/[0.06] text-silver", teal: "bg-teal/15 text-teal-soft", signal: "bg-signal/15 text-signal-soft", amber: "bg-amber-300/15 text-amber-200", rose: "bg-rose-400/15 text-rose-200" }[tone];
  return <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[0.6875rem] font-medium", t)}>{children}</span>;
};

export const Panel = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("rounded-xl border border-white/[0.07] bg-midnight-800/60 p-3.5", className)}>{children}</div>
);

export const Label = ({ children }: { children: ReactNode }) => <p className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-mist">{children}</p>;
