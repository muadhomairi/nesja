import type { Metadata } from "next";
import { FuturePage } from "@/components/sections/FuturePage";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Partners", description: "The NESJA partner ecosystem for implementation, technology and regional partners.", path: "/partners" });

export default function PartnersPage() {
  return <FuturePage eyebrow="Partners" title="Build the commercial future with NESJA." intro="We are preparing a partner programme for organisations that implement, extend and resell the Commercial Operating System."
    points={[{ t: "Implementation partners", b: "Consultancies delivering NESJA deployments and commercial transformation." }, { t: "Technology partners", b: "Software companies integrating their products with NESJA.OS." }, { t: "Regional partners", b: "Partners bringing NESJA to new markets and languages." }]}
    cta={{ label: "Register partner interest", href: "/contact?topic=partners" }} />;
}
