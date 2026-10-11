import type { Metadata } from "next";
import { certifications, controls, securityPrinciples, statusLabel, visible, type TrustItem } from "@/config/security";
import { PageHero, Section, Badge } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Security & Trust",
  description: "How NESJA.OS approaches security, privacy, data residency and sovereign hosting, with the current status of every certification and control.",
  path: "/security",
});

const tone = (s: TrustItem["status"]) => (s === "achieved" ? "teal" : s === "in-progress" ? "signal" : "neutral") as "teal" | "signal" | "neutral";

function StatusList({ items }: { items: TrustItem[] }) {
  return (
    <ul className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07]">
      {visible(items).map((c) => (
        <li key={c.id} className="flex flex-col gap-2 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-cloud">{c.name}</p>
            <p className="mt-1 text-sm text-mist">{c.description}</p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {c.evidenceUrl && c.status === "achieved" && <a href={c.evidenceUrl} className="text-sm text-teal hover:underline">View</a>}
            <Badge tone={tone(c.status)}>{statusLabel[c.status]}</Badge>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function SecurityPage() {
  return (
    <>
      <PageHero eyebrow="Security & trust" title="Your commercial data deserves the highest standard of care." intro="We publish the real status of every certification and control on this page. Nothing here is marked as achieved until it has been independently confirmed.">
        <ButtonLink href="/contact?topic=security" size="lg" variant="secondary" track={{ event: "contact_sales_clicked", props: { location: "security-hero" } }}>Request security information</ButtonLink>
      </PageHero>
      <Section id="principles" eyebrow="Principles" title="How we approach security.">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {securityPrinciples.map((p) => <li key={p.title} className="surface p-6"><Icon name="shield" className="h-5 w-5 text-teal" /><h3 className="mt-4 font-semibold text-cloud">{p.title}</h3><p className="mt-2 text-sm leading-relaxed text-mist">{p.body}</p></li>)}
        </ul>
      </Section>
      <Section id="certifications" className="border-t border-white/[0.06]" eyebrow="Certifications & compliance" title="Certification status." intro="Statuses: Achieved, In progress, Planned.">
        <StatusList items={certifications} />
      </Section>
      <Section id="controls" className="border-t border-white/[0.06]" eyebrow="Platform controls" title="Security and resilience controls." intro="Encryption, identity, access, audit, backup, recovery, residency and sovereign hosting.">
        <StatusList items={controls} />
      </Section>
      <Section id="deployment" className="border-t border-white/[0.06]" eyebrow="Deployment models" title="Designed for where your data needs to live.">
        <ul className="grid gap-4 md:grid-cols-3">
          {[["Multi-tenant cloud", "The standard NESJA service, operated by NESJA."], ["Dedicated environment", "An isolated NESJA environment for a single organisation."], ["Private & sovereign cloud", "Deployment within national or customer-controlled cloud environments, for regulated sectors."]].map(([t, b]) => (
            <li key={t} className="surface p-7"><Icon name="globe" className="h-5 w-5 text-signal-soft" /><h3 className="mt-4 font-semibold text-cloud">{t}</h3><p className="mt-2 text-sm text-mist">{b}</p></li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-mist">Availability of each deployment model is confirmed during your commercial discussion.</p>
      </Section>
    </>
  );
}
