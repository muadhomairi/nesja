import Link from "next/link";
import { modules } from "@/config/modules";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function ModuleGrid({ only, className }: { only?: string[]; className?: string }) {
  const list = only ? modules.filter((m) => only.includes(m.slug)) : modules;
  return (
    <ul className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {list.map((m) => (
        <li key={m.slug}>
          <Link href={`/platform/${m.slug}`} className="surface surface-hover group flex h-full flex-col p-6">
            <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", m.accent === "teal" ? "bg-teal/10 text-teal" : "bg-signal/10 text-signal-soft")}>
              <Icon name={m.icon} />
            </span>
            <span className="mt-5 font-semibold text-cloud">{m.name}</span>
            <span className="mt-1.5 text-sm leading-relaxed text-mist">{m.summary}</span>
            <span className="mt-auto flex items-center gap-1 pt-5 text-sm font-medium text-teal opacity-80 transition-opacity group-hover:opacity-100">
              Explore <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function CardLinkGrid({ items, cols = 3 }: { items: { href: string; title: string; body?: string; eyebrow?: string }[]; cols?: 2 | 3 | 4 }) {
  const c = { 2: "sm:grid-cols-2", 3: "sm:grid-cols-2 lg:grid-cols-3", 4: "sm:grid-cols-2 lg:grid-cols-4" }[cols];
  return (
    <ul className={cn("grid gap-4", c)}>
      {items.map((it) => (
        <li key={it.href}>
          <Link href={it.href} className="surface surface-hover group flex h-full flex-col p-6">
            {it.eyebrow && <span className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">{it.eyebrow}</span>}
            <span className={cn("font-semibold text-cloud", it.eyebrow && "mt-3")}>{it.title}</span>
            {it.body && <span className="mt-2 text-sm leading-relaxed text-mist">{it.body}</span>}
            <span className="mt-auto flex items-center gap-1 pt-5 text-sm font-medium text-teal">Learn more <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100" /></span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
