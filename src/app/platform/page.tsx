import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { SystemMap } from "@/components/sections/SystemMap";
import { ModuleGrid } from "@/components/sections/ModuleGrid";
import { ProductJourney } from "@/components/sections/ProductJourney";
import { Category } from "@/components/sections/home/Category";
import { FinalCta } from "@/components/sections/FinalCta";
import { buildMetadata } from "@/lib/seo";
import { ctas } from "@/config/ctas";
import { brandStatements } from "@/config/site";

export const metadata: Metadata = buildMetadata({
  title: "Platform — The Commercial Operating System",
  description: "One core and connected modules for pipeline, accounts, CPQ, contracts, engagement, customer success, intelligence and AI.",
  path: "/platform",
});

export default function PlatformPage() {
  return (
    <>
      <PageHero eyebrow="Platform" title={<>Every commercial motion. <span className="text-gradient">One operating system.</span></>}
        intro="NESJA.OS is built as an operating system, not a feature list. One data model and one process engine sit at the core. Modules for each commercial function run on top and share everything.">
        <ButtonLink href={ctas.bookDemo.href} size="lg" arrow track={{ event: "hero_demo_clicked", props: { location: "platform-hero" } }}>{ctas.bookDemo.label}</ButtonLink>
        <ButtonLink href="#modules" size="lg" variant="secondary">See the modules</ButtonLink>
      </PageHero>
      <Section id="system" eyebrow="System map" title="One core. Connected modules." intro="Select a module to see what it does and what it connects to. New modules join the same core as NESJA grows.">
        <SystemMap />
      </Section>
      <Section id="modules" className="border-t border-white/[0.06]" eyebrow="Modules" title={brandStatements.primary}>
        <ModuleGrid />
      </Section>
      <Section id="journey" className="border-t border-white/[0.06] bg-midnight-900/40" eyebrow="In practice" title="From first signal to signed contract — without leaving NESJA.">
        <ProductJourney />
      </Section>
      <Category />
      <FinalCta location="platform-final" />
    </>
  );
}
