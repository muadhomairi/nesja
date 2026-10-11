import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui/Section";
import { PricingExperience } from "@/components/pricing/PricingExperience";
import { ComparisonTable } from "@/components/pricing/ComparisonTable";
import { AddOns } from "@/components/pricing/AddOns";
import { Faq } from "@/components/ui/Faq";
import { FinalCta } from "@/components/sections/FinalCta";
import { JsonLd } from "@/components/layout/JsonLd";
import { buildMetadata, faqJsonLd } from "@/lib/seo";
import { pricingConfig, pricingFaqs } from "@/config/pricing";
import { siteConfig } from "@/config/site";
import { startingPrice } from "@/lib/pricing/calculate";

export const metadata: Metadata = buildMetadata({
  title: "Pricing",
  description: "Transparent per-user pricing for the NESJA.OS Commercial Operating System. Longer partnerships, better economics. Calculate your investment.",
  path: "/pricing",
});

/** Product/Offer structured data only when real prices are approved for publication. */
function productJsonLd() {
  if (!pricingConfig.publishStructuredOffers) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: siteConfig.name,
    description: siteConfig.description,
    offers: pricingConfig.editions.filter((e) => e.priceBook).map((e) => ({
      "@type": "Offer", name: e.name, priceCurrency: pricingConfig.defaultCurrency, price: startingPrice(e.id)?.price,
      priceSpecification: { "@type": "UnitPriceSpecification", unitText: "user per month" },
    })),
  };
}

export default function PricingPage() {
  const product = productJsonLd();
  return (
    <>
      <PageHero eyebrow="Pricing" title={<>Longer partnership. <span className="text-gradient">Better economics.</span></>}
        intro="Clear per-user pricing for every edition. Choose your commitment, size your team and see the full picture: price per user, monthly cost, contract value and savings." className="pb-10 md:pb-14" />
      <section aria-label="Pricing and calculator" className="pb-20">
        <div className="container"><PricingExperience /></div>
      </section>
      <Section id="compare" className="border-t border-white/[0.06]" align="center" eyebrow="Compare" title="What each edition includes.">
        <ComparisonTable />
      </Section>
      <Section id="addons" className="border-t border-white/[0.06]" eyebrow="Beyond the licence" title="Transparent about everything else." intro="Your licence covers the platform. These are scoped separately, and quoted before you commit.">
        <AddOns />
      </Section>
      <Section id="faq" className="border-t border-white/[0.06]" eyebrow="Questions" title="Pricing, explained.">
        <div className="max-w-3xl"><Faq items={pricingFaqs} /></div>
      </Section>
      <FinalCta location="pricing-final" headline={["See what NESJA would cost your organisation,", "and what it would change."]} />
      <JsonLd data={faqJsonLd(pricingFaqs)} />
      {product && <JsonLd data={product} />}
    </>
  );
}
