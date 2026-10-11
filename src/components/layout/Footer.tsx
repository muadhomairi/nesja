import Link from "next/link";
import { footerNav, legalNav } from "@/config/navigation";
import { siteConfig, brandStatements } from "@/config/site";
import { Logo } from "@/components/ui/Logo";
import { CookieSettingsButton } from "@/components/analytics/CookieConsent";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

const socialLabels: Record<string, string> = { linkedin: "LinkedIn", youtube: "YouTube", x: "X" };

export function Footer() {
  // Social links render only when a valid https URL is configured.
  const social = Object.entries(siteConfig.social).filter(([, url]) => url.startsWith("https://"));
  return (
    <footer className="relative border-t border-white/[0.06] bg-midnight-900">
      <div className="container py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-mist">{brandStatements.primary}</p>
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold text-cloud">Commercial OS insights, occasionally.</p>
              <NewsletterForm location="footer" />
            </div>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {footerNav.map((group) => (
              <div key={group.title}>
                <p className="text-sm font-semibold text-cloud">{group.title}</p>
                <ul className="mt-4 space-y-2.5">
                  {group.links.map((l) => (
                    <li key={l.href + l.label}>
                      <Link href={l.href} className="text-sm text-mist transition-colors hover:text-cloud">{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
        <div className="hairline my-10" />
        <div className="flex flex-col gap-6 text-sm text-mist md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {siteConfig.legalEntity}. {brandStatements.fabric}</p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legalNav.map((l) => <li key={l.href}><Link href={l.href} className="hover:text-cloud">{l.label}</Link></li>)}
            <li><CookieSettingsButton /></li>
            {social.map(([key, url]) => (
              <li key={key}><a href={url} target="_blank" rel="noopener noreferrer" className="hover:text-cloud">{socialLabels[key]}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
