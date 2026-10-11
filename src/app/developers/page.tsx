import type { Metadata } from "next";
import { FuturePage } from "@/components/sections/FuturePage";
import { ctas } from "@/config/ctas";
import { buildMetadata } from "@/lib/seo";

// Roadmap page: routable, but kept out of navigation, the sitemap and search results.
export const metadata: Metadata = buildMetadata({ title: "Developers", description: "The NESJA developer platform roadmap: public APIs, webhooks and an extension framework.", path: "/developers", noIndex: true });

export default function DevelopersPage() {
  return <FuturePage eyebrow="Developers" title="Build on the Commercial Operating System." intro="Today, API and integration requirements are scoped as part of each NESJA deployment. A public developer platform is on our roadmap."
    section={{ eyebrow: "Roadmap", title: "Developer platform roadmap." }} roadmap
    points={[{ t: "Public APIs", b: "Programmatic access to leads, accounts, opportunities, quotes and contracts." }, { t: "Webhooks & events", b: "Subscriptions to commercial events as they happen." }, { t: "Extension framework", b: "Extensions built on NESJA and distributed through the NESJA Marketplace." }]}
    cta={{ label: ctas.discussIntegration.label, href: `${ctas.discussIntegration.href}&from=developers` }} />;
}
