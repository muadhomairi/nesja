import type { Metadata } from "next";
import { FuturePage } from "@/components/sections/FuturePage";
import { ctas } from "@/config/ctas";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Partners", description: "Partner with NESJA: implementation, technology and regional partnerships around the Commercial Operating System.", path: "/partners" });

export default function PartnersPage() {
  return <FuturePage eyebrow="Partners" title="Partner with NESJA." intro="NESJA works with organisations that implement, integrate and bring the Commercial Operating System to new markets. Tell us about your organisation and how you'd like to work together."
    section={{ eyebrow: "Partnership models", title: "Partnerships we discuss.", intro: "Every partnership is agreed individually, around your capabilities and the customers you serve." }}
    points={[{ t: "Implementation partners", b: "For consultancies delivering commercial transformation and NESJA deployments." }, { t: "Technology partners", b: "For software companies integrating their products with NESJA.OS." }, { t: "Regional partners", b: "For organisations bringing NESJA to new markets and languages." }]}
    cta={{ label: ctas.discussPartnership.label, href: `${ctas.discussPartnership.href}&from=partners` }} />;
}
