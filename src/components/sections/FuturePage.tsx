import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

/** Template for routable, future-ready ecosystem pages (partners, developers, marketplace). */
export function FuturePage({ eyebrow, title, intro, points, cta }: { eyebrow: string; title: string; intro: string; points: { t: string; b: string }[]; cta: { label: string; href: string } }) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro}>
        <ButtonLink href={cta.href} size="lg" arrow>{cta.label}</ButtonLink>
      </PageHero>
      <Section id="plans" eyebrow="What's coming" title="In preparation.">
        <ul className="grid gap-4 md:grid-cols-3">
          {points.map((p) => <li key={p.t} className="surface p-7"><h3 className="font-semibold text-cloud">{p.t}</h3><p className="mt-2 text-sm leading-relaxed text-mist">{p.b}</p></li>)}
        </ul>
      </Section>
    </>
  );
}
