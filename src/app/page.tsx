import type { Metadata } from "next";
import { Hero } from "@/components/sections/home/Hero";
import { ProofStrip, Testimonials, MetricsBand, RecognitionBand } from "@/components/sections/SocialProof";
import { Problem } from "@/components/sections/home/Problem";
import { Category } from "@/components/sections/home/Category";
import { SystemMap } from "@/components/sections/SystemMap";
import { ProductJourney } from "@/components/sections/ProductJourney";
import { AiSection } from "@/components/sections/home/AiSection";
import { TrustSection } from "@/components/sections/home/TrustSection";
import { PricingTeaser } from "@/components/sections/home/PricingTeaser";
import { FinalCta } from "@/components/sections/FinalCta";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { JsonLd } from "@/components/layout/JsonLd";
import { buildMetadata, softwareJsonLd } from "@/lib/seo";
import { siteConfig } from "@/config/site";
import { ctas } from "@/config/ctas";

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} — The Commercial Operating System`,
  description: siteConfig.description,
  path: "/",
});

/**
 * Narrative: Recognition (hero) → Tension (problem) → Understanding (category,
 * system) → Desire (journey, AI) → Proof (trust) → Economics (pricing) → Action.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <ProofStrip />
      <Problem />
      <Category />
      <Section id="platform" eyebrow="The platform" title="Different commercial functions. One intelligent operating system."
        intro="NESJA.OS is one core with connected modules. Each does its job well. Together they share one customer, one process and one source of truth.">
        <SystemMap />
      </Section>
      <Section id="journey" className="border-t border-white/[0.06] bg-midnight-900/40" eyebrow="Product experience"
        title="From first signal to signed contract — without leaving NESJA."
        intro="Follow one opportunity through the whole commercial lifecycle. This is the environment your teams would work in every day.">
        <ProductJourney />
        <div className="mt-12 flex justify-center">
          <ButtonLink href={ctas.seeInAction.href} size="lg" arrow track={{ event: "hero_demo_clicked", props: { location: "journey" } }}>{ctas.seeInAction.label}</ButtonLink>
        </div>
      </Section>
      <AiSection />
      <TrustSection />
      <Testimonials />
      <MetricsBand />
      <RecognitionBand />
      <PricingTeaser />
      <FinalCta />
      <JsonLd data={softwareJsonLd()} />
    </>
  );
}
