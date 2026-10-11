"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { mainNav, type NavItem } from "@/config/navigation";
import { ctas } from "@/config/ctas";
import { siteConfig } from "@/config/site";

// "Sign In" appears only once the NESJA application URL is configured;
// until then the secondary header action is Talk to Sales (no dead links).
const secondaryCta = siteConfig.appUrl ? ctas.signIn : ctas.talkToSales;
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation.
  useEffect(() => { setOpen(null); setMobileOpen(false); }, [pathname]);

  // Escape + outside click close the desktop menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const label = open;
        setOpen(null);
        document.getElementById(`nav-trigger-${slug(label)}`)?.focus();
      }
    };
    const onClick = (e: MouseEvent) => { if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, [open]);

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    if (!mobileOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [mobileOpen]);

  const hoverOpen = useCallback((label: string) => { clearTimeout(closeTimer.current); setOpen(label); }, []);
  const hoverClose = useCallback(() => { clearTimeout(closeTimer.current); closeTimer.current = setTimeout(() => setOpen(null), 160); }, []);

  const isActive = (item: NavItem) =>
    item.href ? pathname.startsWith(item.href) : item.groups?.some((g) => g.links.some((l) => l.href !== "/" && pathname.startsWith(l.href.split("?")[0])));

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled || mobileOpen ? "border-b border-white/[0.06] bg-midnight/85 backdrop-blur-xl" : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container flex h-[var(--header-h)] items-center justify-between gap-6">
        <Logo />

        <nav ref={navRef} aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.label} className="relative" onMouseEnter={() => item.groups && hoverOpen(item.label)} onMouseLeave={() => item.groups && hoverClose()}>
                {item.href ? (
                  <Link href={item.href} className={cn("rounded-full px-4 py-2 text-[0.9375rem] font-medium transition-colors", isActive(item) ? "text-cloud" : "text-silver hover:text-cloud")} aria-current={isActive(item) ? "page" : undefined}>
                    {item.label}
                  </Link>
                ) : (
                  <>
                    <button
                      id={`nav-trigger-${slug(item.label)}`}
                      type="button"
                      aria-expanded={open === item.label}
                      aria-controls={`nav-panel-${slug(item.label)}`}
                      onClick={() => setOpen(open === item.label ? null : item.label)}
                      className={cn("flex items-center gap-1 rounded-full px-4 py-2 text-[0.9375rem] font-medium transition-colors", open === item.label || isActive(item) ? "text-cloud" : "text-silver hover:text-cloud")}
                    >
                      {item.label}
                      <Icon name="chevronDown" className={cn("h-3.5 w-3.5 transition-transform duration-200", open === item.label && "rotate-180")} />
                    </button>
                    <DesktopPanel item={item} visible={open === item.label} onNavigate={() => setOpen(null)} />
                  </>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 min-[360px]:gap-2">
          <Link href={secondaryCta.href} className="hidden rounded-full px-4 py-2 text-[0.9375rem] font-medium text-silver transition-colors hover:text-cloud sm:inline-flex">
            {secondaryCta.label}
          </Link>
          <ButtonLink href={ctas.bookDemo.href} size="sm" className="h-10 whitespace-nowrap px-3 min-[360px]:px-4 sm:px-5" track={{ event: "hero_demo_clicked", props: { location: "header" } }}>
            {ctas.bookDemo.label}
          </ButtonLink>
          <button
            type="button"
            className="-me-2 inline-flex h-11 w-10 items-center min-[360px]:w-11 justify-center rounded-full text-cloud hover:bg-white/5 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <Icon name={mobileOpen ? "x" : "menu"} className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
    {/* Rendered outside <header>: its backdrop-filter would otherwise trap this fixed panel. */}
    {mobileOpen && <MobileNav />}
    </>
  );
}

const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

function DesktopPanel({ item, visible, onNavigate }: { item: NavItem; visible: boolean; onNavigate: () => void }) {
  const wide = (item.groups?.reduce((n, g) => n + g.links.length, 0) ?? 0) > 6;
  return (
    <div
      id={`nav-panel-${slug(item.label)}`}
      hidden={!visible}
      className={cn("absolute top-full pt-3", wide ? "start-1/2 -translate-x-1/2 rtl:translate-x-1/2" : "start-0")}
    >
      <div className={cn("surface animate-fade-up overflow-hidden bg-midnight-800/95 p-2 backdrop-blur-xl [animation-duration:250ms]", wide ? "w-[min(880px,90vw)]" : "w-[340px]")}>
        <div className={cn("grid gap-2", wide && (item.feature ? "grid-cols-[1fr_1.4fr_0.9fr]" : "grid-cols-[1.2fr_1fr]"))}>
          {item.groups?.map((g) => (
            <div key={g.title} className="p-3">
              <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-[0.14em] text-mist">{g.title}</p>
              <ul className={cn(g.links.length > 6 && wide && !item.feature ? "grid grid-cols-1" : "")}>
                {g.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} onClick={onNavigate} className="group block rounded-xl px-2 py-2 transition-colors hover:bg-white/[0.05] focus-visible:bg-white/[0.05]">
                      <span className="block text-sm font-medium text-cloud group-hover:text-teal-soft">{l.label}</span>
                      {l.description && <span className="mt-0.5 block text-[0.8125rem] leading-snug text-mist">{l.description}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {item.feature && (
            <Link href={item.feature.href} onClick={onNavigate} className="group m-1 flex flex-col justify-between rounded-xl border border-white/[0.06] bg-gradient-to-br from-signal/15 via-midnight-700/40 to-teal/10 p-5">
              <div>
                <p className="eyebrow text-[0.65rem]">{item.feature.eyebrow}</p>
                <p className="mt-3 text-base font-semibold leading-snug text-cloud">{item.feature.title}</p>
                <p className="mt-2 text-sm leading-relaxed text-mist">{item.feature.body}</p>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-teal">
                {item.feature.cta} <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileNav() {
  const [section, setSection] = useState<string | null>(null);
  const firstRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);
  useEffect(() => { firstRef.current?.focus(); }, []);

  return (
    <div id="mobile-nav" className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-50 overflow-y-auto bg-midnight lg:hidden">
      <nav aria-label="Mobile" className="container flex min-h-full flex-col pb-8 pt-4">
        <ul className="divide-y divide-white/[0.06]">
          {mainNav.map((item, i) => (
            <li key={item.label}>
              {item.href ? (
                <Link ref={i === 0 ? (el) => { firstRef.current = el; } : undefined} href={item.href} className="flex items-center justify-between py-4 text-lg font-medium text-cloud">
                  {item.label}
                </Link>
              ) : (
                <>
                  <button
                    ref={i === 0 ? (el) => { firstRef.current = el; } : undefined}
                    type="button"
                    className="flex w-full items-center justify-between py-4 text-start text-lg font-medium text-cloud"
                    aria-expanded={section === item.label}
                    aria-controls={`m-${slug(item.label)}`}
                    onClick={() => setSection(section === item.label ? null : item.label)}
                  >
                    {item.label}
                    <Icon name="chevronDown" className={cn("h-5 w-5 text-mist transition-transform", section === item.label && "rotate-180")} />
                  </button>
                  <div id={`m-${slug(item.label)}`} hidden={section !== item.label} className="pb-4">
                    {item.groups?.map((g) => (
                      <div key={g.title} className="mb-3">
                        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-mist">{g.title}</p>
                        <ul className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                          {g.links.map((l) => (
                            <li key={l.href}><Link href={l.href} className="block py-2 text-[0.9375rem] text-silver hover:text-cloud">{l.label}</Link></li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        <div className="mt-auto grid gap-3 pt-8">
          <ButtonLink href={ctas.bookDemo.href} size="lg" arrow track={{ event: "hero_demo_clicked", props: { location: "mobile-nav" } }}>{ctas.bookDemo.label}</ButtonLink>
          <ButtonLink href={secondaryCta.href} size="lg" variant="secondary">{secondaryCta.label}</ButtonLink>
        </div>
      </nav>
    </div>
  );
}
