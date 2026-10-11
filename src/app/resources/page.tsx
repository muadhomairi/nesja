import type { Metadata } from "next";
import Link from "next/link";
import { resources, resourceTypes, resourceTypeLabel } from "@/config/resources";
import { PageHero, Section, Badge } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Resources",
  description: "Insights, guides, research and playbooks on running a connected commercial organisation. Read the Commercial Operating System Manifesto.",
  path: "/resources",
});

export default function ResourcesPage() {
  const featured = resources.find((r) => r.featured);
  const rest = resources.filter((r) => r !== featured);
  const counts = (t: string) => resources.filter((r) => r.type === t).length;
  return (
    <>
      <PageHero eyebrow="Resources" title="Ideas for running a connected commercial organisation." intro="Perspectives, guidance and research from the team building the Commercial Operating System." />
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
      <Section id="latest" eyebrow="Latest" title="Recent writing.">
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
      </Section>
      <Section id="library" className="border-t border-white/[0.06]" eyebrow="Library" title="What you'll find here.">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resourceTypes.map((t) => (
            <li key={t.id} className="rounded-2xl border border-white/[0.07] p-6">
              <div className="flex items-center justify-between"><h3 className="font-semibold text-cloud">{t.label}</h3>{counts(t.id) === 0 && <Badge>Coming soon</Badge>}</div>
              <p className="mt-2 text-sm text-mist">{t.description}</p>
            </li>
          ))}
        </ul>
        <div className="mt-12 max-w-md">
          <p className="mb-3 font-semibold text-cloud">Get new resources when they&apos;re published.</p>
          <NewsletterForm location="resources" />
        </div>
      </Section>
    </>
  );
}
