"use client";
/**
 * Buttons & button-styled links. One visual hierarchy rule: a view has only
 * one `primary` (teal) action. `track` sends an analytics event on click.
 */
import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { track } from "@/lib/analytics";
import type { AnalyticsEventMap, AnalyticsEventName } from "@/lib/analytics/events";
import { Icon } from "./Icon";

type Variant = "primary" | "secondary" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";

// Labels wrap only on narrow screens when they would otherwise overflow.
const base = "relative inline-flex max-w-full items-center justify-center gap-2 text-center sm:whitespace-nowrap rounded-full font-semibold transition-all duration-200 ease-brand focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-50";
const variants: Record<Variant, string> = {
  primary: "bg-teal text-midnight shadow-[0_8px_30px_-10px_rgb(var(--teal)/0.6)] hover:bg-teal-soft hover:shadow-[0_10px_36px_-8px_rgb(var(--teal)/0.7)] active:translate-y-px",
  secondary: "border border-white/15 bg-white/[0.03] text-cloud hover:border-white/30 hover:bg-white/[0.07]",
  ghost: "text-silver hover:text-cloud hover:bg-white/[0.05]",
  quiet: "text-teal hover:text-teal-soft px-0",
};
const sizes: Record<Size, string> = { sm: "min-h-9 py-1.5 px-4 text-sm", md: "min-h-11 py-2 px-5 text-[0.9375rem]", lg: "min-h-[3.25rem] py-2.5 px-7 text-base" };

export const buttonClass = (variant: Variant = "primary", size: Size = "md", className?: string) =>
  cn(base, variants[variant], variant === "quiet" ? "h-auto" : sizes[size], className);

type TrackProp = { [E in AnalyticsEventName]: { event: E; props: AnalyticsEventMap[E] } }[AnalyticsEventName];

interface LinkProps {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  arrow?: boolean;
  track?: TrackProp;
  external?: boolean;
  "aria-label"?: string;
}

export function ButtonLink({ href, children, variant = "primary", size = "md", className, arrow, track: t, external, ...rest }: LinkProps) {
  const onClick = () => t && track(t.event as AnalyticsEventName, t.props as never);
  const content = (
    <>
      {children}
      {arrow && <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:-scale-x-100" />}
    </>
  );
  if (external) return <a href={href} className={cn("group", buttonClass(variant, size, className))} onClick={onClick} target="_blank" rel="noopener noreferrer" {...rest}>{content}</a>;
  return <Link href={href} className={cn("group", buttonClass(variant, size, className))} onClick={onClick} {...rest}>{content}</Link>;
}

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?: Variant; size?: Size; loading?: boolean; arrow?: boolean }

export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button({ variant = "primary", size = "md", className, loading, arrow, children, disabled, ...rest }, ref) {
  return (
    <button ref={ref} className={cn("group", buttonClass(variant, size, className))} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />}
      {children}
      {arrow && !loading && <Icon name="arrowRight" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:-scale-x-100" />}
    </button>
  );
});
