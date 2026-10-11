import type { Metadata } from "next";
import { integrations, integrationStatusLabel } from "@/config/integrations";
import { PageHero, Section, Badge } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Integrations",
  description: "NESJA works with the systems your business already runs on: productivity suites, messaging, ERP and finance, contact centre, payments and BI.",
  path: "/integrations",
});

export default function IntegrationsPage() {
  const categories = [...new Set(integrations.map((i) => i.category))];
  return (
    <>
      <PageHero eyebrow="Integrations" title="NESJA works with the systems your business already runs on." intro="NESJA is the commercial operating environment. Your ERP, productivity suite and communication platforms stay where they are, and connect to it.">
        <ButtonLink href="/contact?topic=integrations" size="lg" variant="secondary">Discuss an integration</ButtonLink>
      </PageHero>
      <Section id="catalogue" eyebrow="Ecosystem" title="Integration roadmap." intro="Statuses reflect current availability. Third-party names are trademarks of their owners and are shown for identification only.">
        <div className="space-y-10">
          {categories.map((c) => (
            <div key={c}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-mist">{c}</h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {integrations.filter((i) => i.category === c).map((i) => (
                  <li key={i.id} className="flex items-start justify-between gap-3 rounded-2xl border border-white/[0.07] bg-midnight-800/40 p-5">
                    <div><p className="font-semibold text-cloud">{i.name}</p><p className="mt-1 text-sm text-mist">{i.description}</p></div>
                    <Badge tone={i.status === "available" ? "teal" : "neutral"}>{integrationStatusLabel[i.status]}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
      <Section id="marketplace" className="border-t border-white/[0.06]" eyebrow="Long term" title="NESJA Marketplace." intro="A future home for certified integrations, extensions and partner solutions built on NESJA.OS.">
        <ButtonLink href="/marketplace" variant="secondary" arrow>About the Marketplace</ButtonLink>
      </Section>
    </>
  );
}
