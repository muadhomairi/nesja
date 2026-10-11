import { hero } from "@/content/home";
import { ctas } from "@/config/ctas";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden pb-16 pt-28 md:pb-24 md:pt-36 lg:pt-40">
      <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden="true" />
      <div className="pointer-events-none absolute -top-48 end-[-10%] h-[640px] w-[640px] rounded-full bg-signal/[0.12] blur-[140px]" aria-hidden="true" />
      <div className="pointer-events-none absolute bottom-[-20%] start-[-10%] h-[520px] w-[520px] rounded-full bg-teal/[0.07] blur-[140px]" aria-hidden="true" />
      <Container className="relative grid items-center gap-12 lg:grid-cols-[1.02fr_1fr] lg:gap-10">
        <div className="animate-fade-up">
          <p className="eyebrow mb-6"><span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden="true" />{hero.eyebrow}</p>
          <h1 id="hero-title" className="text-display-xl text-cloud">
            {hero.headline[0]}
            <br />
            <span className="text-gradient">{hero.headline[1]}</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-mist md:text-xl">{hero.body}</p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ButtonLink href={ctas.bookDemo.href} size="lg" arrow track={{ event: "hero_demo_clicked", props: { location: "hero" } }}>{ctas.bookDemo.label}</ButtonLink>
            <ButtonLink href={ctas.explorePlatform.href} size="lg" variant="secondary" track={{ event: "platform_explored", props: { location: "hero" } }}>{ctas.explorePlatform.label}</ButtonLink>
          </div>
        </div>
        <div className="animate-fade-up [animation-delay:150ms]">
          <HeroVisual />
        </div>
      </Container>
    </section>
  );
}
