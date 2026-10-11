import type { Metadata } from "next";
import { FuturePage } from "@/components/sections/FuturePage";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Developers", description: "APIs, webhooks and extension points for building on NESJA.OS.", path: "/developers" });

export default function DevelopersPage() {
  return <FuturePage eyebrow="Developers" title="Build on the Commercial Operating System." intro="APIs and extension points that let your teams and partners connect systems, automate processes and extend NESJA."
    points={[{ t: "Public APIs", b: "Programmatic access to leads, accounts, opportunities, quotes and contracts." }, { t: "Webhooks & events", b: "Subscribe to commercial events as they happen." }, { t: "Extension framework", b: "Build and distribute extensions through the NESJA Marketplace." }]}
    cta={{ label: "Request developer access", href: "/contact?topic=developers" }} />;
}
