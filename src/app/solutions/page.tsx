import type { Metadata } from "next";
import { roles } from "@/config/roles";
import { industries } from "@/config/industries";
import { PageHero, Section } from "@/components/ui/Section";
import { CardLinkGrid } from "@/components/sections/ModuleGrid";
import { FinalCta } from "@/components/sections/FinalCta";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Solutions by role and industry",
  description: "How NESJA.OS serves CEOs, commercial leaders, sales, sales operations, marketing, finance and customer success teams.",
  path: "/solutions",
});

export default function SolutionsPage() {
  return (
    <>
      <PageHero eyebrow="Solutions" title="One system. Every commercial role." intro="Each team sees the commercial operation from its own angle. NESJA gives them all the same foundation, so leadership, sales, finance and success are finally working from one picture." />
      <Section id="roles" eyebrow="By role" title="Built for the people who run the commercial engine.">
        <CardLinkGrid items={roles.map((r) => ({ href: `/solutions/${r.slug}`, eyebrow: r.role, title: r.headline, body: r.intro }))} />
      </Section>
      <Section id="industries" className="border-t border-white/[0.06]" eyebrow="By industry" title="Applied to how your industry sells.">
        <CardLinkGrid cols={3} items={industries.map((i) => ({ href: `/industries/${i.slug}`, title: i.name, body: i.headline }))} />
      </Section>
      <FinalCta location="solutions-final" />
    </>
  );
}
