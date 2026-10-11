import { PageHero, Section, Badge } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Template for ecosystem pages (partners, developers, marketplace). Pages
 * describing capabilities that are not yet available pass `roadmap` so every
 * item is labelled as such.
 */
export function FuturePage({ eyebrow, title, intro, section, points, cta, roadmap }: {
  eyebrow: string; title: string; intro: string;
  section: { eyebrow: string; title: string; intro?: string };
  points: { t: string; b: string }[];
  cta: { label: string; href: string };
  roadmap?: boolean;
}) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} intro={intro}>
        <ButtonLink href={cta.href} size="lg" arrow track={{ event: "contact_sales_clicked", props: { location: `${eyebrow.toLowerCase().replace(/\s+/g, "-")}-hero` } }}>{cta.label}</ButtonLink>
      </PageHero>
      <Section id="details" eyebrow={section.eyebrow} title={section.title} intro={section.intro}>
        <ul className="grid gap-4 md:grid-cols-3">
          {points.map((p) => (
            <li key={p.t} className="surface p-7">
              <div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-cloud">{p.t}</h3>{roadmap && <Badge>Roadmap</Badge>}</div>
              <p className="mt-2 text-sm leading-relaxed text-mist">{p.b}</p>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
