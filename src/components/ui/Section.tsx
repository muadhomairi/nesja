import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("container", className)}>{children}</div>;
}

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  intro?: ReactNode;
  align?: "start" | "center";
  children?: ReactNode;
  className?: string;
  headerClassName?: string;
  as?: "section" | "div";
  labelledBy?: string;
}

/** Every section answers one primary question: eyebrow → title → intro → content. */
export function Section({ id, eyebrow, title, intro, align = "start", children, className, headerClassName, as: Tag = "section" }: SectionProps) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <Tag id={id} aria-labelledby={title && headingId ? headingId : undefined} className={cn("relative py-20 md:py-28", className)}>
      <Container>
        {(eyebrow || title || intro) && (
          <header className={cn("mb-12 max-w-3xl md:mb-16", align === "center" && "mx-auto text-center", headerClassName)}>
            {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
            {title && <h2 id={headingId} className="text-display-md text-cloud">{title}</h2>}
            {intro && <p className="mt-5 text-lg leading-relaxed text-mist">{intro}</p>}
          </header>
        )}
        {children}
      </Container>
    </Tag>
  );
}

export function Badge({ children, tone = "neutral", className }: { children: ReactNode; tone?: "neutral" | "teal" | "signal" | "amber"; className?: string }) {
  const tones = {
    neutral: "border-white/10 bg-white/[0.04] text-silver",
    teal: "border-teal/30 bg-teal/10 text-teal-soft",
    signal: "border-signal/30 bg-signal/10 text-signal-soft",
    amber: "border-amber-300/25 bg-amber-300/10 text-amber-200",
  };
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>{children}</span>;
}

export function PageHero({ eyebrow, title, intro, children, className }: { eyebrow?: string; title: ReactNode; intro?: ReactNode; children?: ReactNode; className?: string }) {
  return (
    <section className={cn("relative overflow-hidden pb-16 pt-32 md:pb-24 md:pt-44", className)}>
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-70" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-40 start-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-signal/[0.09] blur-[120px] rtl:translate-x-1/2" aria-hidden="true" />
      <Container className="relative">
        <div className="max-w-3xl animate-fade-up">
          {eyebrow && <p className="eyebrow mb-5">{eyebrow}</p>}
          <h1 className="text-display-lg text-cloud">{title}</h1>
          {intro && <p className="mt-6 max-w-2xl text-lg leading-relaxed text-mist md:text-xl">{intro}</p>}
          {children && <div className="mt-9 flex flex-wrap items-center gap-3">{children}</div>}
        </div>
      </Container>
    </section>
  );
}
