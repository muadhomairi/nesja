import type { Metadata } from "next";
import { FuturePage } from "@/components/sections/FuturePage";
import { ctas } from "@/config/ctas";
import { buildMetadata } from "@/lib/seo";

// Roadmap page: routable, but kept out of navigation, the sitemap and search results.
export const metadata: Metadata = buildMetadata({ title: "Marketplace", description: "The NESJA Marketplace roadmap: certified integrations, industry extensions and partner solutions.", path: "/marketplace", noIndex: true });

export default function MarketplacePage() {
  return <FuturePage eyebrow="NESJA Marketplace" title="An ecosystem around one commercial fabric." intro="The NESJA Marketplace is on our roadmap as the home for certified integrations, industry extensions and partner solutions. Today, integrations are scoped as part of each NESJA deployment."
    section={{ eyebrow: "Roadmap", title: "Marketplace roadmap." }} roadmap
    points={[{ t: "Certified integrations", b: "Connectors reviewed for security and data quality." }, { t: "Industry extensions", b: "Configurations and templates for specific sectors." }, { t: "Partner solutions", b: "Services and apps from NESJA partners." }]}
    cta={{ label: ctas.discussIntegration.label, href: `${ctas.discussIntegration.href}&from=marketplace` }} />;
}
