import type { Metadata } from "next";
import Link from "next/link";
import { publicCaseStudies } from "@/config/social-proof";
import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Customers",
  description: "Customer stories from organisations running their commercial operation on NESJA.OS.",
  path: "/customers",
});

/** Renders only verified, consented case studies. Until then, an honest invitation. */
export default function CustomersPage() {
  const stories = publicCaseStudies();
  return (
    <>
      <PageHero eyebrow="Customers" title="Stories from commercial organisations running on NESJA." intro="We publish customer stories only with our customers' consent and with outcomes they have verified." />
      <Section id="stories">
        {stories.length ? (
          <ul className="grid gap-5 md:grid-cols-2">
            {stories.map((s) => (
              <li key={s.slug} className="surface p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-teal">{s.industry} · {s.country}</p>
                <h2 className="mt-3 text-xl font-semibold text-cloud">{s.company}</h2>
                <dl className="mt-5 space-y-3 text-sm">
                  <div><dt className="font-medium text-silver">Challenge</dt><dd className="text-mist">{s.challenge}</dd></div>
                  <div><dt className="font-medium text-silver">With NESJA</dt><dd className="text-mist">{s.implementation}</dd></div>
                  <div><dt className="font-medium text-silver">Outcome</dt><dd className="text-mist">{s.outcome}</dd></div>
                </dl>
                {s.metric?.verified && <p className="mt-6 text-3xl font-semibold text-cloud">{s.metric.value} <span className="text-sm font-normal text-mist">{s.metric.label}</span></p>}
              </li>
            ))}
          </ul>
        ) : (
          <div className="surface mx-auto max-w-3xl p-8 text-center md:p-12">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal/10 text-teal"><Icon name="building" className="h-6 w-6" /></span>
            <h2 className="mt-6 text-2xl font-semibold text-cloud">Our first customer stories are being written.</h2>
            <p className="mx-auto mt-4 max-w-xl leading-relaxed text-mist">
              We&apos;d rather show you nothing than show you something that isn&apos;t real. As customers complete their deployments and approve their stories, you&apos;ll find them here: the challenge, how NESJA was implemented and the outcomes they measured.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/book-demo" arrow track={{ event: "hero_demo_clicked", props: { location: "customers" } }}>Book a Demo</ButtonLink>
              <ButtonLink href="/contact?topic=early-customer" variant="secondary">Talk to us about early adoption</ButtonLink>
            </div>
            <p className="mt-8 text-sm text-mist">Want to see how NESJA would fit your organisation? <Link href="/platform" className="text-teal hover:underline">Explore the platform</Link>.</p>
          </div>
        )}
      </Section>
    </>
  );
}
