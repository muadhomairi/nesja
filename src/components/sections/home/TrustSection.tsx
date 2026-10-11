import Link from "next/link";
import { certifications, securityPrinciples, statusLabel, visible } from "@/config/security";
import { Badge, Container } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";

/** Proof without fabrication: principles plus honest certification status. */
export function TrustSection() {
  return (
    <section id="trust" aria-labelledby="trust-title" className="border-y border-white/[0.06] bg-midnight-900/40 py-24 md:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="eyebrow mb-4">Trust</p>
          <h2 id="trust-title" className="text-display-md text-cloud">Built for organisations that can&apos;t afford to get it wrong.</h2>
          <p className="mt-5 text-lg leading-relaxed text-mist">Commercial data is among the most sensitive data a company holds. NESJA is designed for dedicated, private and sovereign deployment, and we publish the real status of every certification on our roadmap.</p>
          <Link href="/security" className="mt-7 inline-flex items-center gap-1.5 font-semibold text-teal hover:text-teal-soft">Security & trust <Icon name="arrowRight" className="h-4 w-4 rtl:-scale-x-100" /></Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {securityPrinciples.map((p) => (
            <div key={p.title} className="surface p-6">
              <Icon name="shield" className="h-5 w-5 text-teal" />
              <h3 className="mt-4 font-semibold text-cloud">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{p.body}</p>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
            <span className="me-1 text-xs font-medium uppercase tracking-[0.14em] text-mist">{visible(certifications).every((c) => c.status === "achieved") ? "Certifications" : "Certification roadmap"}</span>
            {visible(certifications).map((c) => (
              <Badge key={c.id} tone={c.status === "achieved" ? "teal" : "neutral"}>{c.name} · {statusLabel[c.status]}</Badge>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
