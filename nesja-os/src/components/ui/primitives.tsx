import Link from "next/link";
import type { ReactNode } from "react";
import { CheckCircle2, CircleSlash, Inbox, OctagonAlert, TriangleAlert } from "lucide-react";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-3">
      <div className="min-w-0">
        <h1 className="page-title text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
      </div>
      {actions && <div className="ms-auto flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const BTN = {
  primary: "bg-brand-500 text-on-brand hover:bg-brand-400",
  secondary: "border border-line-strong bg-surface text-fg hover:bg-hover",
  ghost: "text-muted hover:bg-hover hover:text-fg",
  danger: "bg-bad text-white hover:opacity-90",
};
export function Button({ children, variant = "primary", className, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof BTN }) {
  return <button {...p} className={cx("inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition disabled:opacity-50", BTN[variant], className)}>{children}</button>;
}
export function ButtonLink({ href, children, variant = "primary", className }: { href: string; children: ReactNode; variant?: keyof typeof BTN; className?: string }) {
  return <Link href={href} className={cx("inline-flex items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold transition", BTN[variant], className)}>{children}</Link>;
}

export function Card({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("card min-w-0 p-4", className)}>
      {(title || action) && <div className="mb-3 flex items-center gap-2"><h2 className="text-sm font-semibold">{title}</h2><div className="ms-auto">{action}</div></div>}
      {children}
    </section>
  );
}

const TONE = { ok: "bg-ok/12 text-ok", warn: "bg-warn/12 text-warn", bad: "bg-bad/12 text-bad", info: "bg-info/12 text-info", neutral: "bg-surface-3 text-muted", brand: "bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-100" };
export type Tone = keyof typeof TONE;
export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return <span className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", TONE[tone])}>{children}</span>;
}

const STATUS = { on_target: ["On target", "text-ok", CheckCircle2], at_risk: ["At risk", "text-warn", TriangleAlert], off_target: ["Off target", "text-bad", OctagonAlert], none: ["No target", "text-muted", CircleSlash] } as const;
/** KPI tile: value, status in words + icon (never colour alone), optional comparison, always a drill-down link. */
export function Kpi({ label, value, href, hint, status = "none", sub }: { label: string; value: string; href: string; hint?: string; status?: keyof typeof STATUS; sub?: ReactNode }) {
  const [text, cls, Icon] = STATUS[status];
  return (
    <Link href={href} title={hint} className="group card flex flex-col p-4 hover:border-brand-500">
      <div className="flex items-start gap-2"><span className="text-xs font-medium text-muted">{label}</span>
        {status !== "none" && <span className={cx("ms-auto inline-flex items-center gap-1 text-[11px] font-semibold", cls)}><Icon className="h-3.5 w-3.5" />{text}</span>}</div>
      <span className="mt-1 text-2xl font-semibold tabular tracking-tight">{value}</span>
      {sub && <div className="mt-1 text-[11px] text-muted">{sub}</div>}
      <span className="mt-2 text-[11px] font-medium text-accent-700 opacity-0 transition group-hover:opacity-100 dark:text-accent-300">Drill down →</span>
    </Link>
  );
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return <div className="card flex flex-col items-center gap-2 p-10 text-center"><Inbox className="h-8 w-8 text-subtle" /><p className="font-semibold">{title}</p>{children && <div className="max-w-md text-sm text-muted">{children}</div>}</div>;
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn" | "bad" | "ok"; children: ReactNode }) {
  const c = { info: "border-info/30 bg-info/8", warn: "border-warn/30 bg-warn/8", bad: "border-bad/30 bg-bad/8", ok: "border-ok/30 bg-ok/8" }[tone];
  return <div role="status" className={cx("rounded-lg border px-3 py-2 text-sm", c)}>{children}</div>;
}

export function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: ReactNode }) {
  return <label htmlFor={htmlFor} className="block space-y-1 text-sm"><span className="font-medium">{label}</span>{children}{hint && <span className="block text-xs text-muted">{hint}</span>}</label>;
}
export const inputCls = "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm outline-none focus:border-focus";
export function Input(p: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...p} className={cx(inputCls, p.className)} />; }
export function Select(p: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select {...p} className={cx(inputCls, p.className)} />; }
