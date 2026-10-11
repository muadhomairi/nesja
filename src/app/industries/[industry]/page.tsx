import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIndustry, industries } from "@/config/industries";
import { modules } from "@/config/modules";
import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CardLinkGrid } from "@/components/sections/ModuleGrid";
import { FinalCta } from "@/components/sections/FinalCta";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import Link from "next/link";

type Params = { params: Promise<{ industry: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => industries.map((i) => ({ industry: i.slug }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const i = getIndustry((await params).industry);
  if (!i) return {};
  return buildMetadata({ title: i.seoTitle, description: i.intro, path: `/industries/${i.slug}` });
}

export default async function IndustryPage({ params }: Params) {
  const i = getIndustry((await params).industry);
  if (!i) notFound();
  return (
    <>
      <PageHero eyebrow={i.name} title={i.headline} intro={i.intro}>
        <ButtonLink href="/book-demo" size="lg" arrow track={{ event: "hero_demo_clicked", props: { location: `industry-${i.slug}` } }}>Book a Demo</ButtonLink>
      </PageHero>
      <Section id="realities" eyebrow="Commercial realities" title={`What makes ${i.name.toLowerCase()} different.`}>
        <ul className="grid gap-4 md:grid-cols-3">
          {i.realities.map((r) => <li key={r} className="surface p-6 text-silver">{r}</li>)}
        </ul>
      </Section>
      <Section id="applications" className="border-t border-white/[0.06]" eyebrow="How NESJA applies" title="The platform, applied.">
        <ul className="grid gap-4 md:grid-cols-3">
          {i.applications.map((a) => (
            <li key={a.title} className="surface flex flex-col p-7">
              <Icon name="check" className="h-5 w-5 text-teal" />
              <h3 className="mt-4 font-semibold text-cloud">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{a.body}</p>
              <ul className="mt-auto flex flex-wrap gap-1.5 pt-5">
                {a.modules.map((s) => { const m = modules.find((x) => x.slug === s); return m ? <li key={s}><Link href={`/platform/${s}`} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-silver hover:border-teal/50 hover:text-cloud">{m.name}</Link></li> : null; })}
              </ul>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-sm text-mist">This page describes how NESJA&apos;s existing capabilities apply to {i.name.toLowerCase()} organisations. Talk to us about any sector-specific requirements.</p>
      </Section>
      <Section id="more" className="border-t border-white/[0.06]" eyebrow="Other industries" title="Explore other sectors.">
        <CardLinkGrid cols={3} items={industries.filter((x) => x.slug !== i.slug).slice(0, 3).map((x) => ({ href: `/industries/${x.slug}`, eyebrow: x.name, title: x.headline }))} />
      </Section>
      <FinalCta location={`industry-${i.slug}-final`} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Industries", path: "/industries" }, { name: i.name, path: `/industries/${i.slug}` }])} />
    </>
  );
}
