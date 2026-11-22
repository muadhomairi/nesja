import type { ReactNode } from "react";
import Link from "next/link";
import { LogoMark } from "./logo";
import { env } from "@/lib/env";
/** Premium sign-in frame shared by every authentication page. */
export function AuthFrame({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-midnight p-12 text-cloud lg:flex lg:flex-col">
        <div className="absolute inset-0 opacity-40" style={{ background: "radial-gradient(60% 50% at 20% 20%, #57c2e955, transparent), radial-gradient(50% 40% at 80% 80%, #4b6bff44, transparent)" }} aria-hidden />
        <a href={env.websiteUrl()} className="relative inline-flex items-center gap-2"><LogoMark className="h-9 w-9" /><span className="font-display text-lg font-bold tracking-[0.08em]">NESJA<span className="text-sky">.OS</span></span></a>
        <div className="relative mt-auto max-w-md">
          <p className="font-display text-3xl font-semibold leading-tight">One commercial operating system, from first lead to renewal.</p>
          <p className="mt-4 text-sm text-silver">NESJA Commercial, NESJA Engage and NESJA Deliver share one NESJA identity.</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><LogoMark className="h-10 w-10" /></div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-8 border-t border-line pt-6 text-center text-sm text-muted">{footer}</div>}
          <p className="mt-10 text-center text-xs text-subtle"><Link href="/demo" className="hover:underline">Try the interactive demo</Link> · <a href={env.websiteUrl()} className="hover:underline">nesja.ai</a></p>
        </div>
      </div>
    </div>
  );
}
