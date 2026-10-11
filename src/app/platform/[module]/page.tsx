import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModule, modules } from "@/config/modules";
import { PageHero, Section, Badge } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { AppFrame } from "@/components/mockups/AppFrame";
import { journeyViews, moduleViews } from "@/components/mockups/views";
import { ModuleGrid } from "@/components/sections/ModuleGrid";
import { FinalCta } from "@/components/sections/FinalCta";
import { TrackOnView } from "@/components/analytics/TrackOnView";
import { JsonLd } from "@/components/layout/JsonLd";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { ctas } from "@/config/ctas";

type Params = { params: Promise<{ module: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => modules.map((m) => ({ module: m.slug }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const m = getModule((await params).module);
  if (!m) return {};
  return buildMetadata({ title: `${m.name} — ${m.summary}`, description: m.intro, path: `/platform/${m.slug}` });
}

export default async function ModulePage({ params }: Params) {
  const m = getModule((await params).module);
  if (!m) notFound();
  const View = journeyViews[moduleViews[m.slug] ?? "dashboard"];
  return (
    <>
      <TrackOnView event="module_viewed" props={{ module: m.slug }} />
      <PageHero eyebrow={m.name} title={m.headline} intro={m.intro}>
        <ButtonLink href={`${ctas.bookDemo.href}?module=${m.slug}`} size="lg" arrow track={{ event: "hero_demo_clicked", props: { location: `module-${m.slug}` } }}>{ctas.bookDemo.label}</ButtonLink>
        <ButtonLink href="/platform" size="lg" variant="secondary">Platform overview</ButtonLink>
      </PageHero>

      <section aria-label={`${m.name} product view`} className="-mt-4 pb-8">
        <div className="container">
          <AppFrame activeModule={m.slug} title={m.label.toLowerCase()} className="mx-auto max-w-5xl"><View /></AppFrame>
        </div>
      </section>

      <Section id="outcomes" eyebrow="Outcomes" title="What changes for your teams.">
        <ul className="grid gap-4 md:grid-cols-3">
          {m.outcomes.map((o) => <li key={o} className="surface flex gap-3 p-6 text-cloud"><Icon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-teal" /><span className="font-medium">{o}</span></li>)}
        </ul>
      </Section>

      <Section id="capabilities" className="border-t border-white/[0.06]" eyebrow="Capabilities" title={`Inside ${m.name}`}>
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-3">
          {m.capabilities.map((c) => (
            <li key={c.title} className="bg-midnight p-7">
              <div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-cloud">{c.title}</h3>{c.status === "roadmap" && <Badge tone="signal">On the roadmap</Badge>}</div>
              <p className="mt-2 text-sm leading-relaxed text-mist">{c.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="connected" className="border-t border-white/[0.06]" eyebrow="Connected by design" title={`${m.name} works with`} intro="Every module shares one data model, so context moves with the work instead of being re-keyed.">
        <ModuleGrid only={m.connectsTo} />
      </Section>
      <FinalCta location={`module-${m.slug}-final`} />
      <JsonLd data={breadcrumbJsonLd([{ name: "Platform", path: "/platform" }, { name: m.name, path: `/platform/${m.slug}` }])} />
    </>
  );
}
