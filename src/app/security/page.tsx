import type { Metadata } from "next";
import { certifications, controls, securityPrinciples, statusLabel, visible, type TrustItem } from "@/config/security";
import { ctas } from "@/config/ctas";
import { PageHero, Section, Badge } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Security & Trust",
  description: "How NESJA.OS approaches security, privacy, data residency and sovereign hosting: our principles, deployment models, platform controls and certification roadmap.",
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

const securityCta = { ...ctas.requestSecurity, href: `${ctas.requestSecurity.href}&from=security` };

export default function SecurityPage() {
  return (
    <>
      <PageHero eyebrow="Security & trust" title="Your commercial data deserves the highest standard of care." intro="NESJA is designed for organisations that hold sensitive commercial data. This page sets out our security principles, deployment architecture and platform controls, and the real status of every certification on our roadmap.">
        <ButtonLink href={securityCta.href} size="lg" arrow track={{ event: "contact_sales_clicked", props: { location: "security-hero" } }}>{securityCta.label}</ButtonLink>
      </PageHero>
      <Section id="principles" eyebrow="Principles" title="How we approach security.">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {securityPrinciples.map((p) => <li key={p.title} className="surface p-6"><Icon name="shield" className="h-5 w-5 text-teal" /><h3 className="mt-4 font-semibold text-cloud">{p.title}</h3><p className="mt-2 text-sm leading-relaxed text-mist">{p.body}</p></li>)}
        </ul>
      </Section>
      <Section id="deployment" className="border-t border-white/[0.06]" eyebrow="Architecture" title="Designed for where your data needs to live.">
        <ul className="grid gap-4 md:grid-cols-3">
          {[["Multi-tenant cloud", "The standard NESJA service, operated by NESJA."], ["Dedicated environment", "An isolated NESJA environment for a single organisation."], ["Private & sovereign cloud", "Deployment within national or customer-controlled cloud environments, for regulated sectors."]].map(([t, b]) => (
            <li key={t} className="surface p-7"><Icon name="globe" className="h-5 w-5 text-signal-soft" /><h3 className="mt-4 font-semibold text-cloud">{t}</h3><p className="mt-2 text-sm text-mist">{b}</p></li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-mist">The deployment model for your organisation is agreed as part of your proposal.</p>
      </Section>
      <Section id="controls" className="border-t border-white/[0.06]" eyebrow="Platform controls" title="Security and resilience controls." intro="Encryption, identity, access, audit, backup, recovery, residency and sovereign hosting, with the current status of each.">
        <StatusList items={controls} />
      </Section>
      <Section id="certifications" className="border-t border-white/[0.06]" eyebrow="Certifications & compliance" title="Certification roadmap." intro="We list each certification with its real status: Achieved, In progress or Planned. Nothing is shown as achieved until it has been independently confirmed.">
        <StatusList items={certifications} />
      </Section>
      <Section id="security-review" className="border-t border-white/[0.06]" eyebrow="Security reviews" title="Request security information." intro="Tell us what your security and procurement review requires. We'll respond with the information that applies to your deployment.">
        <ButtonLink href={securityCta.href} size="lg" arrow track={{ event: "contact_sales_clicked", props: { location: "security-footer" } }}>{securityCta.label}</ButtonLink>
      </Section>
    </>
  );
}
