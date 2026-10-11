import type { Metadata } from "next";
import { integrations, integrationStatusLabel, integrationStatusHelp, type IntegrationStatus } from "@/config/integrations";
import { ctas } from "@/config/ctas";
import { PageHero, Section, Badge } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Integrations",
  description: "Connect NESJA to your commercial environment. Integration requirements are scoped around the systems, workflows and data exchanges your deployment needs.",
  path: "/integrations",
});

const tone = (s: IntegrationStatus) => (s === "available" ? "teal" : s === "roadmap" ? "neutral" : "signal") as "teal" | "signal" | "neutral";
const statusOrder: IntegrationStatus[] = ["available", "configurable", "custom", "roadmap"];

export default function IntegrationsPage() {
  const categories = [...new Set(integrations.map((i) => i.category))];
  return (
    <>
      <PageHero eyebrow="Integrations" title="Connect NESJA to your commercial environment." intro="Integration requirements vary by organisation. NESJA can be scoped around the systems, workflows and data exchanges required for your deployment.">
        <ButtonLink href={`${ctas.discussIntegration.href}&from=integrations-hero`} size="lg" arrow track={{ event: "contact_sales_clicked", props: { location: "integrations-hero" } }}>{ctas.discussIntegration.label}</ButtonLink>
      </PageHero>
      <Section id="approach" eyebrow="How we scope integrations" title="Built around your systems, not ours.">
        <ul className="grid gap-4 md:grid-cols-3">
          {[
            ["Map your environment", "We identify the ERP, productivity, communication and data platforms your commercial teams rely on."],
            ["Agree the data exchanges", "We define which records and events move between NESJA and each system, and in which direction."],
            ["Plan the approach", "Each integration is scoped as part of your deployment, with its status agreed in your proposal."],
          ].map(([t, b]) => <li key={t} className="surface p-7"><h3 className="font-semibold text-cloud">{t}</h3><p className="mt-2 text-sm leading-relaxed text-mist">{b}</p></li>)}
        </ul>
      </Section>
      <Section id="catalogue" className="border-t border-white/[0.06]" eyebrow="Ecosystem" title="Integration status." intro="Every status on this page reflects what is true today. Third-party names are trademarks of their owners and are shown for identification only.">
        <dl className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statusOrder.map((s) => (
            <div key={s} className="rounded-2xl border border-white/[0.07] p-4">
              <dt><Badge tone={tone(s)}>{integrationStatusLabel[s]}</Badge></dt>
              <dd className="mt-2 text-sm text-mist">{integrationStatusHelp[s]}</dd>
            </div>
          ))}
        </dl>
        <div className="space-y-10">
          {categories.map((c) => (
            <div key={c}>
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-mist">{c}</h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {integrations.filter((i) => i.category === c).map((i) => (
                  <li key={i.id} className="flex items-start justify-between gap-3 rounded-2xl border border-white/[0.07] bg-midnight-800/40 p-5">
                    <div><p className="font-semibold text-cloud">{i.name}</p><p className="mt-1 text-sm text-mist">{i.description}</p></div>
                    <Badge tone={tone(i.status)}>{integrationStatusLabel[i.status]}</Badge>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>
      <Section id="discuss" className="border-t border-white/[0.06]" eyebrow="Your requirements" title="Discuss your integration requirements." intro="Tell us which systems your commercial organisation relies on and we'll assess the appropriate integration approach.">
        <ButtonLink href={`${ctas.discussIntegration.href}&from=integrations-footer`} size="lg" arrow track={{ event: "contact_sales_clicked", props: { location: "integrations-footer" } }}>{ctas.discussIntegration.label}</ButtonLink>
      </Section>
    </>
  );
}
