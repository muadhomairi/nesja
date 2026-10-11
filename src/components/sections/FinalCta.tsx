import { finalCta } from "@/content/home";
import { ctas } from "@/config/ctas";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";

export function FinalCta({ headline = finalCta.headline, supporting = finalCta.supporting, location = "final-cta", secondary = ctas.exploreOS }: { headline?: readonly string[]; supporting?: string; location?: string; secondary?: { label: string; href: string } }) {
  return (
    <section aria-labelledby={`${location}-title`} className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" aria-hidden="true" />
      <div className="pointer-events-none absolute start-1/2 top-1/2 h-[420px] w-[820px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal/[0.10] blur-[130px] rtl:translate-x-1/2" aria-hidden="true" />
      <Container className="relative text-center">
        <h2 id={`${location}-title`} className="mx-auto max-w-4xl text-display-lg text-cloud">
          {headline[0]}{headline[1] && <><br /><span className="text-gradient">{headline[1]}</span></>}
        </h2>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href={ctas.bookDemo.href} size="lg" arrow track={{ event: "hero_demo_clicked", props: { location } }}>{ctas.bookDemo.label}</ButtonLink>
          <ButtonLink href={secondary.href} size="lg" variant="secondary" track={secondary.href.startsWith("/contact") ? { event: "contact_sales_clicked", props: { location } } : { event: "platform_explored", props: { location } }}>{secondary.label}</ButtonLink>
        </div>
        <p className="mt-8 text-sm font-medium tracking-wide text-mist">{supporting}</p>
      </Container>
    </section>
  );
}
