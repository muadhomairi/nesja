import { pricingConfig } from "@/config/pricing";
import { calculateQuote } from "@/lib/pricing/calculate";
import { formatMoney } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Section";
import { cn } from "@/lib/cn";

/** Anchoring: longer commitments visibly improve economics. Values come from pricing config. */
export function PricingTeaser() {
  const edition = pricingConfig.defaultEdition;
  const ed = pricingConfig.editions.find((e) => e.id === edition)!;
  return (
    <section id="economics" aria-labelledby="economics-title" className="py-24 md:py-32">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow mb-4">Pricing</p>
          <h2 id="economics-title" className="text-display-md text-cloud">Longer partnership. Better economics.</h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-mist">Transparent per-user pricing. Choose the commitment that suits you, and see exactly what it means before you speak to anyone.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/pricing" variant="secondary" arrow track={{ event: "cta_clicked", props: { label: "See pricing", href: "/pricing", location: "home-pricing" } }}>Calculate your investment</ButtonLink>
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm text-mist">{ed.name} edition, per user per month</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pricingConfig.terms.map((t) => {
              const q = calculateQuote({ editionId: edition, termId: t.id, seats: 1 });
              const popular = t.highlight === "most-popular";
              return (
                <li key={t.id} className={cn("relative rounded-2xl border p-5", popular ? "border-teal/50 bg-teal/[0.07]" : "border-white/[0.08] bg-midnight-800/50")}>
                  {popular && <span className="absolute -top-2.5 start-4 rounded-full bg-signal-soft px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-midnight">Most popular</span>}
                  <p className="text-sm font-medium text-silver">{t.label}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-tight text-cloud tabular-nums">{formatMoney(q.pricePerUser, q.currency)}</p>
                  <p className={cn("mt-1 text-xs", q.savingsPercent ? "text-teal-soft" : "text-mist")}>{q.savingsPercent ? `Save ${q.savingsPercent}%` : "No commitment"}</p>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-mist">12, 24 and 36-month prices are per-user monthly equivalents of a fixed-term agreement.</p>
        </div>
      </Container>
    </section>
  );
}
