import type { Metadata } from "next";
import Link from "next/link";
import { resources, resourceTypeLabel } from "@/config/resources";
import { PageHero, Section, Badge } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "NESJA Perspectives",
  description: "Research, practical commercial operating models and product insights from NESJA. Read the Commercial Operating System Manifesto.",
  path: "/resources",
});

export default function ResourcesPage() {
  const featured = resources.find((r) => r.featured);
  const rest = resources.filter((r) => r !== featured);
  return (
    <>
      <PageHero eyebrow="Resources" title="NESJA Perspectives" intro="Research, practical commercial operating models and product insights from NESJA." />
      {featured && (
        <section aria-label="Featured" className="pb-8">
          <div className="container">
            <Link href={`/resources/${featured.slug}`} className="group relative block overflow-hidden rounded-3xl border border-teal/30 bg-gradient-to-br from-signal/[0.14] via-midnight-800 to-teal/[0.10] p-8 md:p-14">
              <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" aria-hidden="true" />
              <div className="relative max-w-2xl">
                <Badge tone="teal">Flagship · {resourceTypeLabel(featured.type)}</Badge>
                <h2 className="mt-5 text-display-md text-cloud">{featured.title}</h2>
                <p className="mt-4 text-lg leading-relaxed text-silver">{featured.excerpt}</p>
                <span className="mt-8 inline-flex items-center gap-2 font-semibold text-teal">Read the Manifesto · {featured.readingMinutes} min <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100" /></span>
              </div>
            </Link>
          </div>
        </section>
      )}
      {rest.length > 0 && <Section id="latest" eyebrow="Latest" title="Recent Perspectives.">
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rest.map((r) => (
            <li key={r.slug}>
              <Link href={`/resources/${r.slug}`} className="surface surface-hover flex h-full flex-col p-6">
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">{resourceTypeLabel(r.type)}</span>
                <span className="mt-3 text-lg font-semibold text-cloud">{r.title}</span>
                <span className="mt-2 text-sm leading-relaxed text-mist">{r.excerpt}</span>
                <span className="mt-auto pt-6 text-xs text-mist">{r.readingMinutes} min read</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>}
      <Section id="subscribe" className="border-t border-white/[0.06]" eyebrow="Subscribe" title="New Perspectives, when they're published." intro="Occasional writing on commercial operating models, research and NESJA product updates.">
        <div className="max-w-md"><NewsletterForm location="resources" /></div>
      </Section>
    </>
  );
}
