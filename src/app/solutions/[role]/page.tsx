import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRole, roles } from "@/config/roles";
import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { ModuleGrid, CardLinkGrid } from "@/components/sections/ModuleGrid";
import { FinalCta } from "@/components/sections/FinalCta";
import { buildMetadata } from "@/lib/seo";

type Params = { params: Promise<{ role: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => roles.map((r) => ({ role: r.slug }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = getRole((await params).role);
  if (!r) return {};
  return buildMetadata({ title: `NESJA.OS for ${r.role}`, description: `${r.headline} ${r.intro}`, path: `/solutions/${r.slug}` });
}

export default async function RolePage({ params }: Params) {
  const r = getRole((await params).role);
  if (!r) notFound();
  return (
    <>
      <PageHero eyebrow={`For the ${r.role}`} title={r.headline} intro={r.intro}>
        <ButtonLink href="/book-demo" size="lg" arrow track={{ event: "hero_demo_clicked", props: { location: `role-${r.slug}` } }}>Book a Demo</ButtonLink>
      </PageHero>
      <Section id="challenges" eyebrow="The challenge" title="What gets in the way today.">
        <ul className="grid gap-4 md:grid-cols-3">
          {r.challenges.map((c) => <li key={c} className="rounded-2xl border border-dashed border-white/[0.12] p-6 text-silver"><Icon name="alert" className="mb-4 h-5 w-5 text-rose-300/70" />{c}</li>)}
        </ul>
      </Section>
      <Section id="how" className="border-t border-white/[0.06]" eyebrow="With NESJA" title="How NESJA.OS helps.">
        <ul className="grid gap-4 md:grid-cols-3">
          {r.howNesjaHelps.map((h) => <li key={h.title} className="surface p-7"><Icon name="check" className="h-5 w-5 text-teal" /><h3 className="mt-4 font-semibold text-cloud">{h.title}</h3><p className="mt-2 text-sm leading-relaxed text-mist">{h.body}</p></li>)}
        </ul>
      </Section>
      <Section id="modules" className="border-t border-white/[0.06]" eyebrow="Most used modules" title={`Where the ${r.role} works in NESJA`}>
        <ModuleGrid only={r.modules} />
      </Section>
      <Section id="other-roles" className="border-t border-white/[0.06]" eyebrow="Other roles" title="One system, shared across the commercial organisation.">
        <CardLinkGrid cols={3} items={roles.filter((x) => x.slug !== r.slug).slice(0, 3).map((x) => ({ href: `/solutions/${x.slug}`, eyebrow: x.role, title: x.headline }))} />
      </Section>
      <FinalCta location={`role-${r.slug}-final`} />
    </>
  );
}
