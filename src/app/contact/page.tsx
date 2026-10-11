import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { Icon } from "@/components/ui/Icon";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Contact Sales", description: "Talk to the NESJA team about sales, enterprise deployment, proposals, implementation, integrations, security or partnership.", path: "/contact" });

export default function ContactPage() {
  return (
    <section className="relative overflow-hidden pb-24 pt-28 md:pt-36">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" aria-hidden="true" />
      <Container className="relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:pt-4">
          <p className="eyebrow mb-4">Contact sales</p>
          <h1 className="text-display-lg text-cloud">Talk to the NESJA team.</h1>
          <p className="mt-5 text-lg leading-relaxed text-mist">Tell us what you are trying to improve across your commercial organisation. We&apos;ll understand your requirements and help determine whether NESJA is the right fit.</p>
          <ul className="mt-8 space-y-3 text-[0.9375rem] text-silver">
            {["Sales and enterprise enquiries", "Commercial proposals", "Implementation and deployment planning", "Integration and security requirements", "Partnerships"].map((x) => (
              <li key={x} className="flex items-center gap-2.5"><Icon name="check" className="h-4 w-4 shrink-0 text-teal" />{x}</li>
            ))}
          </ul>
          <div className="mt-10 rounded-2xl border border-white/[0.07] p-6">
            <p className="font-semibold text-cloud">Prefer to see the product first?</p>
            <p className="mt-1 text-sm text-mist">Book a 30-minute demonstration tailored to your organisation.</p>
            <ButtonLink href="/book-demo" variant="secondary" size="sm" className="mt-4" arrow>Book a Demo</ButtonLink>
          </div>
          {siteConfig.contactEmail && <p className="mt-6 text-sm text-mist">Or email <a href={`mailto:${siteConfig.contactEmail}`} className="text-teal hover:underline">{siteConfig.contactEmail}</a></p>}
        </div>
        <ContactForm />
      </Container>
    </section>
  );
}
