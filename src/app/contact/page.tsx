import type { Metadata } from "next";
import { ContactForm } from "@/components/forms/ContactForm";
import { Container } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Contact Sales", description: "Talk to the NESJA commercial team about the Commercial Operating System.", path: "/contact" });

export default function ContactPage() {
  return (
    <section className="relative overflow-hidden pb-24 pt-28 md:pt-36">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" aria-hidden="true" />
      <Container className="relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:pt-4">
          <p className="eyebrow mb-4">Contact sales</p>
          <h1 className="text-display-lg text-cloud">Talk to the NESJA team.</h1>
          <p className="mt-5 text-lg leading-relaxed text-mist">Tell us a little about your organisation and what you&apos;re looking to achieve. Five fields, and a person replies.</p>
          <div className="mt-10 rounded-2xl border border-white/[0.07] p-6">
            <p className="font-semibold text-cloud">Prefer to see the product first?</p>
            <p className="mt-1 text-sm text-mist">Choose a time that suits you for a 30-minute demo.</p>
            <ButtonLink href="/book-demo" variant="secondary" size="sm" className="mt-4" arrow>Book a Demo</ButtonLink>
          </div>
          {siteConfig.contactEmail && <p className="mt-6 text-sm text-mist">Or email <a href={`mailto:${siteConfig.contactEmail}`} className="text-teal hover:underline">{siteConfig.contactEmail}</a></p>}
        </div>
        <ContactForm />
      </Container>
    </section>
  );
}
