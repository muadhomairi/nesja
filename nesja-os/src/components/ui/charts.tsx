/** Dependency-free SVG charts on the design-system series tokens. Each bar can link to the records behind it. */
import Link from "next/link";

export function BarChart({ data, height = 180, format }: { data: { label: string; value: number; href?: string; series2?: number }[]; height?: number; format: (n: number) => string }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.value, d.series2 ?? 0)));
  return (
    <div className="flex min-w-0 items-end gap-0.5 overflow-hidden" style={{ height }} role="img" aria-label={data.map((d) => `${d.label}: ${format(d.value)}`).join(", ")}>
      {data.map((d, i) => {
        const every = Math.max(1, Math.ceil(data.length / 12));
        const bar = (
          <div className="flex h-full min-w-0 flex-1 flex-col justify-end gap-0.5" title={`${d.label}: ${format(d.value)}${d.series2 !== undefined ? ` (plan ${format(d.series2)})` : ""}`}>
            <div className="flex items-end gap-px" style={{ height: "100%" }}>
              <div className="flex-1 rounded-t bg-[var(--series-1)]" style={{ height: `${(d.value / max) * 100}%` }} />
              {d.series2 !== undefined && <div className="flex-1 rounded-t bg-[var(--series-6)] opacity-50" style={{ height: `${(d.series2 / max) * 100}%` }} />}
            </div>
            <span className="h-3 truncate text-center text-[10px] text-muted">{i % every === 0 ? d.label : ""}</span>
          </div>
        );
        return d.href ? <Link key={d.label} href={d.href} aria-label={`${d.label}: ${format(d.value)}`} className="flex h-full min-w-0 flex-1 hover:opacity-80">{bar}</Link> : <div key={d.label} className="flex h-full min-w-0 flex-1">{bar}</div>;
      })}
    </div>
  );
}

export function Funnel({ stages, format }: { stages: { label: string; value: number; count: number; href: string }[]; format: (n: number) => string }) {
  const max = Math.max(1, ...stages.map((s) => s.value));
  return (
    <div className="space-y-1.5">
      {stages.map((s, i) => (
        <Link key={s.label} href={s.href} className="flex items-center gap-2 text-xs hover:opacity-80">
          <span className="w-28 shrink-0 text-muted">{s.label}</span>
          <span className="h-5 rounded" style={{ width: `${Math.max(2, (s.value / max) * 100)}%`, background: `var(--series-${(i % 8) + 1})` }} />
          <span className="shrink-0 tabular">{format(s.value)} · {s.count}</span>
        </Link>
      ))}
    </div>
  );
}
