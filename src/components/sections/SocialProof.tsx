/**
 * Social-proof components. Each renders ONLY verified + consented content via
 * the public selectors, and returns null otherwise. Day one shows industries.
 */
import Image from "next/image";
import Link from "next/link";
import { builtForIndustries, publicCaseStudies, publicLogos, publicMetrics, publicRecognitions, publicTestimonials } from "@/config/social-proof";
import { industries } from "@/config/industries";
import { Container } from "@/components/ui/Section";

export function ProofStrip() {
  const logos = publicLogos();
  return (
    <section aria-label="Who NESJA is built for" className="border-y border-white/[0.06] bg-midnight-900/50 py-10">
      <Container>
        {logos.length > 0 ? (
          <>
            <p className="text-center text-sm font-medium text-mist">Trusted by commercial teams at</p>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {logos.map((l) => <li key={l.id}><Image src={l.logo} alt={l.company} width={120} height={36} className="h-8 w-auto opacity-80" /></li>)}
            </ul>
          </>
        ) : (
          <div className="flex flex-col items-center gap-5 lg:flex-row lg:justify-between">
            <p className="shrink-0 text-sm font-medium text-silver">Built for modern commercial organisations</p>
            <ul className="flex flex-wrap justify-center gap-2 lg:justify-end">
              {builtForIndustries.map((name) => {
                const ind = industries.find((i) => i.name === name);
                return (
                  <li key={name}>
                    <Link href={ind ? `/industries/${ind.slug}` : "/industries"} className="inline-flex rounded-full border border-white/[0.08] px-3.5 py-1.5 text-sm text-mist transition-colors hover:border-white/20 hover:text-cloud">
                      {name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </Container>
    </section>
  );
}

export function Testimonials() {
  const items = publicTestimonials().filter((t) => t.featured);
  if (!items.length) return null;
  return (
    <section aria-label="What customers say" className="py-20">
      <Container className="grid gap-6 md:grid-cols-2">
        {items.map((t) => (
          <figure key={t.id} className="surface p-8">
            <blockquote className="text-lg leading-relaxed text-cloud">“{t.quote}”</blockquote>
            <figcaption className="mt-6 text-sm text-mist"><span className="font-semibold text-cloud">{t.name}</span>, {t.jobTitle}, {t.company}</figcaption>
          </figure>
        ))}
      </Container>
    </section>
  );
}

export function MetricsBand() {
  const items = publicMetrics();
  if (!items.length) return null;
  return (
    <Container className="grid gap-6 py-12 sm:grid-cols-3">
      {items.map((m) => (
        <div key={m.id}><p className="text-4xl font-semibold text-cloud">{m.value}</p><p className="mt-2 text-sm text-mist">{m.label}</p></div>
      ))}
    </Container>
  );
}

export function RecognitionBand() {
  const items = publicRecognitions();
  if (!items.length) return null;
  return (
    <Container className="flex flex-wrap gap-4 py-10">
      {items.map((r) => <div key={r.id} className="surface px-5 py-3 text-sm"><span className="font-semibold text-cloud">{r.name}</span> <span className="text-mist">{r.detail}</span></div>)}
    </Container>
  );
}

export const hasCaseStudies = () => publicCaseStudies().length > 0;
