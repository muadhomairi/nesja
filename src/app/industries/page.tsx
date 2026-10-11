import type { Metadata } from "next";
import { industries } from "@/config/industries";
import { PageHero, Section } from "@/components/ui/Section";
import { CardLinkGrid } from "@/components/sections/ModuleGrid";
import { FinalCta } from "@/components/sections/FinalCta";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Industries",
  description: "How the NESJA.OS Commercial Operating System applies to financial services, telecommunications, healthcare, government, utilities, technology and more.",
  path: "/industries",
});

export default function IndustriesPage() {
  return (
    <>
      <PageHero eyebrow="Industries" title="The same operating system, applied to how your industry sells." intro="Commercial complexity looks different in every sector. These pages explain how the NESJA platform applies to each one today." />
      <Section id="list">
        <CardLinkGrid cols={3} items={industries.map((i) => ({ href: `/industries/${i.slug}`, eyebrow: i.name, title: i.headline }))} />
      </Section>
      <FinalCta location="industries-final" />
    </>
  );
}
