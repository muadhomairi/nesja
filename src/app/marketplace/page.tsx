import type { Metadata } from "next";
import { FuturePage } from "@/components/sections/FuturePage";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Marketplace", description: "The future NESJA Marketplace for integrations, extensions and partner solutions.", path: "/marketplace" });

export default function MarketplacePage() {
  return <FuturePage eyebrow="NESJA Marketplace" title="An ecosystem around one commercial fabric." intro="The NESJA Marketplace will bring certified integrations, industry extensions and partner solutions into the Commercial Operating System."
    points={[{ t: "Certified integrations", b: "Connectors reviewed for security and data quality." }, { t: "Industry extensions", b: "Configurations and templates for specific sectors." }, { t: "Partner solutions", b: "Services and apps from the NESJA partner ecosystem." }]}
    cta={{ label: "Get notified", href: "/contact?topic=marketplace" }} />;
}
