"use client";
/**
 * Pricing experience: term selector → edition cards → calculator.
 * Every number is computed by src/lib/pricing/calculate.ts from
 * src/config/pricing.ts. No commercial values are hard-coded here.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { pricingConfig, type EditionId, type TermId } from "@/config/pricing";
import { currencies, type CurrencyCode } from "@/config/locales";
import { features } from "@/config/site";
import { availableCurrencies, calculateQuote, clampSeats, getEdition, termSavingsPercent } from "@/lib/pricing/calculate";
import { formatMoney, formatNumber } from "@/lib/format";
import { track } from "@/lib/analytics";
import { ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { modules } from "@/config/modules";
import { cn } from "@/lib/cn";

const pricedEditions = pricingConfig.editions.filter((e) => e.priceBook);
const isTerm = (v: string | null): v is TermId => !!v && pricingConfig.terms.some((t) => t.id === v);
const isPriced = (v: string | null): v is EditionId => !!v && pricedEditions.some((e) => e.id === v);

export function PricingExperience() {
  const [term, setTerm] = useState<TermId>(pricingConfig.defaultTerm);
  const [edition, setEdition] = useState<EditionId>(pricingConfig.defaultEdition);
  const [seats, setSeats] = useState<number>(pricingConfig.defaultSeats);
  const [currency, setCurrency] = useState<CurrencyCode>(pricingConfig.defaultCurrency);
  const hydrated = useRef(false);

  // Restore shareable state from the URL (?edition=&term=&seats=).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (isTerm(q.get("term"))) setTerm(q.get("term") as TermId);
    if (isPriced(q.get("edition"))) setEdition(q.get("edition") as EditionId);
    const s = Number(q.get("seats"));
    if (s > 0) setSeats(clampSeats(s));
    hydrated.current = true;
    track("pricing_viewed", {});
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const q = new URLSearchParams(window.location.search);
    q.set("edition", edition); q.set("term", term); q.set("seats", String(seats));
    window.history.replaceState(null, "", `${window.location.pathname}?${q}${window.location.hash}`);
  }, [edition, term, seats]);

  // Debounced seat tracking so dragging the slider doesn't flood analytics.
  useEffect(() => {
    if (!hydrated.current) return;
    const t = setTimeout(() => track("seat_count_changed", { seats, edition }), 700);
    return () => clearTimeout(t);
  }, [seats, edition]);

  const changeTerm = (t: TermId) => { setTerm(t); track("pricing_duration_changed", { term: t, edition }); };
  const changeEdition = (e: EditionId) => { setEdition(e); track("pricing_edition_changed", { edition: e }); };

  return (
    <div className="space-y-16 md:space-y-24">
      <div>
        <TermSelector term={term} edition={edition} currency={currency} onChange={changeTerm} />
        <EditionCards term={term} currency={currency} seats={seats} />
      </div>
      <Calculator {...{ term, edition, seats, currency }} onTerm={changeTerm} onEdition={changeEdition} onSeats={setSeats}
        onCurrency={(c) => { setCurrency(c); track("pricing_currency_changed", { currency: c }); }} />
    </div>
  );
}

function TermSelector({ term, edition, currency, onChange }: { term: TermId; edition: EditionId; currency: CurrencyCode; onChange: (t: TermId) => void }) {
  return (
    <fieldset className="mx-auto mb-10 max-w-3xl">
      <legend className="mb-4 w-full text-center text-sm font-medium text-silver">Contract duration</legend>
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/[0.08] bg-midnight-800/60 p-1.5 sm:grid-cols-4">
        {pricingConfig.terms.map((t) => {
          const save = termSavingsPercent(edition, t.id, currency);
          const checked = t.id === term;
          return (
            <label key={t.id} className={cn("relative flex cursor-pointer flex-col items-center gap-1 rounded-xl px-3 py-3 text-center transition-all duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal",
              checked ? "bg-midnight-600 shadow-panel" : "hover:bg-white/[0.04]")}>
              <input type="radio" name="term" value={t.id} checked={checked} onChange={() => onChange(t.id)} className="sr-only" />
              {t.highlight === "most-popular" && <span className="absolute -top-2.5 rounded-full bg-signal-soft px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-midnight">Most popular</span>}
              <span className={cn("text-sm font-semibold", checked ? "text-cloud" : "text-silver")}>{t.label}</span>
              <span className={cn("text-xs", save > 0 ? "text-teal-soft" : "text-mist")}>{save > 0 ? `Save ${save}%` : "No commitment"}</span>
            </label>
          );
        })}
      </div>
      <p className="mt-3 text-center text-sm text-mist" aria-live="polite">{pricingConfig.terms.find((t) => t.id === term)?.commitment}</p>
    </fieldset>
  );
}

function EditionCards({ term, currency, seats }: { term: TermId; currency: CurrencyCode; seats: number }) {
  const termDef = pricingConfig.terms.find((t) => t.id === term)!;
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {pricingConfig.editions.map((e) => {
        const q = calculateQuote({ editionId: e.id, termId: term, seats: 1, currency });
        const featured = e.recommended;
        const href = e.cta === "talk-to-sales" ? "/contact?type=enterprise" : `/book-demo?edition=${e.id}&term=${term}&seats=${seats}`;
        return (
          <article key={e.id} aria-labelledby={`ed-${e.id}`} className={cn("relative flex flex-col rounded-3xl border p-7 transition-colors md:p-8", featured ? "border-teal/45 bg-gradient-to-b from-teal/[0.08] to-midnight-800/60 shadow-glow" : "border-white/[0.08] bg-midnight-800/50 hover:border-white/15")}>
            {featured && <Badge tone="teal" className="absolute -top-3 start-7 bg-midnight">Recommended</Badge>}
            <h3 id={`ed-${e.id}`} className="text-sm font-bold uppercase tracking-[0.16em] text-cloud">{e.name}</h3>
            <p className="mt-1 text-sm text-teal-soft">{e.tagline}</p>
            <div className="mt-6 min-h-[5.5rem]">
              {q.status === "priced" ? (
                <>
                  <p className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-semibold tracking-tight text-cloud tabular-nums">{formatMoney(q.pricePerUser, currency)}</span>
                    <span className="text-sm text-mist">/ user / month</span>
                  </p>
                  <p className="mt-1.5 text-sm text-mist">
                    {termDef.months === 1 ? "Billed monthly. No commitment." : `With a ${termDef.months}-month agreement.`}
                    {q.savingsPercent > 0 && <span className="text-teal-soft"> Save {q.savingsPercent}% vs monthly.</span>}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-4xl font-semibold tracking-tight text-cloud">Custom</p>
                  <p className="mt-1.5 text-sm text-mist">Tailored to your organisation, deployment and volume.</p>
                </>
              )}
            </div>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-silver">{e.description}</p>
            <ul className="mt-6 space-y-2.5 text-sm text-silver">
              {e.highlights.map((h) => <li key={h} className="flex gap-2.5"><Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-teal" />{h}</li>)}
            </ul>
            {e.suitableFor && (
              <div className="mt-6">
                <p className="text-xs font-medium uppercase tracking-[0.14em] text-mist">Suitable for</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">{e.suitableFor.map((s) => <li key={s} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-silver">{s}</li>)}</ul>
              </div>
            )}
            <div className="mt-auto pt-8">
              <ButtonLink href={href} variant={featured ? "primary" : "secondary"} className="w-full" arrow={featured}
                track={e.cta === "talk-to-sales" ? { event: "contact_sales_clicked", props: { location: "pricing-enterprise" } } : { event: "pricing_cta_clicked", props: { edition: e.id, term, seats, cta: "edition-card" } }}>
                {e.cta === "talk-to-sales" ? "Talk to Sales" : "Book a Demo"}
              </ButtonLink>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ---------- Calculator ---------- */
const MAX = pricingConfig.enterpriseSeatThreshold;
const toSlider = (s: number) => Math.round((Math.log(Math.min(Math.max(s, 1), MAX)) / Math.log(MAX)) * 1000);
const fromSlider = (p: number) => {
  const raw = Math.exp((p / 1000) * Math.log(MAX));
  const step = raw < 100 ? 1 : raw < 500 ? 5 : raw < 2000 ? 10 : 50;
  return clampSeats(Math.round(raw / step) * step);
};

interface CalcProps { term: TermId; edition: EditionId; seats: number; currency: CurrencyCode; onTerm: (t: TermId) => void; onEdition: (e: EditionId) => void; onSeats: (n: number) => void; onCurrency: (c: CurrencyCode) => void }

function Calculator({ term, edition, seats, currency, onTerm, onEdition, onSeats, onCurrency }: CalcProps) {
  const q = useMemo(() => calculateQuote({ editionId: edition, termId: term, seats, currency }), [edition, term, seats, currency]);
  const [draft, setDraft] = useState(String(seats));
  useEffect(() => setDraft(String(seats)), [seats]);
  const currencyOptions = availableCurrencies();
  const termDef = q.term;
  const enterprise = q.exceedsSelfServeRange;
  const included = getEdition(edition).includedModules.map((s) => modules.find((m) => m.slug === s)?.label).filter(Boolean);

  const commitInput = () => {
    const n = Number(draft.replace(/[^\d]/g, ""));
    if (n > 0) onSeats(clampSeats(n)); else setDraft(String(seats));
  };

  return (
    <section id="calculator" aria-labelledby="calc-title" className="scroll-mt-28">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="eyebrow mb-4 justify-center">Investment calculator</p>
        <h2 id="calc-title" className="text-display-md text-cloud">Model your agreement.</h2>
        <p className="mt-4 text-lg text-mist">Choose an edition, team size and duration. Every figure updates as you go.</p>
      </div>

      <div className="grid overflow-hidden rounded-3xl border border-white/[0.08] bg-midnight-800/40 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8 p-6 md:p-10">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-cloud">Edition</legend>
            <div className="grid grid-cols-2 gap-2">
              {pricedEditions.map((e) => (
                <label key={e.id} className={cn("cursor-pointer rounded-xl border px-4 py-3 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal", edition === e.id ? "border-teal/60 bg-teal/[0.08]" : "border-white/10 hover:border-white/25")}>
                  <input type="radio" name="calc-edition" value={e.id} checked={edition === e.id} onChange={() => onEdition(e.id)} className="sr-only" />
                  <span className="block text-sm font-semibold text-cloud">{e.name}</span>
                  <span className="block text-xs text-mist">{e.tagline}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <div className="mb-3 flex items-end justify-between gap-4">
              <label htmlFor="seat-input" className="text-sm font-semibold text-cloud">Number of users</label>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => onSeats(clampSeats(seats - (seats > 100 ? 10 : 1)))} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-silver hover:border-white/30 hover:text-cloud" aria-label="Decrease users"><Icon name="minus" className="h-4 w-4" /></button>
                <input id="seat-input" inputMode="numeric" value={draft} onChange={(e) => setDraft(e.target.value)} onBlur={commitInput} onKeyDown={(e) => e.key === "Enter" && commitInput()}
                  className="h-10 w-24 rounded-xl border border-white/[0.12] bg-midnight-900/70 text-center text-lg font-semibold tabular-nums text-cloud focus:outline-none focus:ring-2 focus:ring-teal/50" aria-describedby="seat-help" />
                <button type="button" onClick={() => onSeats(clampSeats(seats + (seats >= 100 ? 10 : 1)))} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-silver hover:border-white/30 hover:text-cloud" aria-label="Increase users"><Icon name="plus" className="h-4 w-4" /></button>
              </div>
            </div>
            <input type="range" min={0} max={1000} value={toSlider(seats)} onChange={(e) => onSeats(fromSlider(Number(e.target.value)))} aria-label="Number of users" aria-valuetext={`${formatNumber(seats)} users`}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-teal" />
            <div className="mt-4 flex flex-wrap gap-1.5" role="group" aria-label="Quick select users">
              {pricingConfig.seatPresets.map((n) => (
                <button key={n} type="button" onClick={() => onSeats(n)} aria-pressed={seats === n}
                  className={cn("rounded-full border px-3 py-1.5 text-xs font-medium tabular-nums transition-colors", seats === n ? "border-teal/60 bg-teal/15 text-teal-soft" : "border-white/10 text-silver hover:border-white/25 hover:text-cloud")}>{formatNumber(n)}</button>
              ))}
              <button type="button" onClick={() => onSeats(MAX)} aria-pressed={seats >= MAX}
                className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors", seats >= MAX ? "border-signal/60 bg-signal/15 text-signal-soft" : "border-white/10 text-silver hover:border-white/25 hover:text-cloud")}>{formatNumber(MAX)}+</button>
            </div>
            <p id="seat-help" className="mt-3 text-xs text-mist">Type any number or use the slider. For {formatNumber(MAX)}+ users we tailor an Enterprise agreement.</p>
          </div>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-cloud">Contract duration</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {pricingConfig.terms.map((t) => {
                const save = termSavingsPercent(edition, t.id, currency);
                return (
                  <label key={t.id} className={cn("relative cursor-pointer rounded-xl border px-3 py-2.5 text-center transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal", term === t.id ? "border-teal/60 bg-teal/[0.08]" : "border-white/10 hover:border-white/25")}>
                    <input type="radio" name="calc-term" value={t.id} checked={term === t.id} onChange={() => onTerm(t.id)} className="sr-only" />
                    <span className="block text-sm font-semibold text-cloud">{t.label}</span>
                    <span className={cn("block text-[0.6875rem]", save ? "text-teal-soft" : "text-mist")}>{save ? `Save ${save}%` : "Flexible"}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {features.currencySelector && currencyOptions.length > 1 ? (
            <div>
              <label htmlFor="currency" className="mb-2 block text-sm font-semibold text-cloud">Currency</label>
              <select id="currency" value={currency} onChange={(e) => onCurrency(e.target.value as CurrencyCode)} className="h-11 rounded-xl border border-white/[0.12] bg-midnight-900/70 px-3 text-cloud">
                {currencyOptions.map((c) => <option key={c} value={c}>{c} · {currencies[c].label}</option>)}
              </select>
            </div>
          ) : (
            <p className="text-xs text-mist">Prices in {currencies[currency].label} ({currency}), excluding applicable taxes. Regional pricing is available from your account team.</p>
          )}
        </div>

        <div className="relative border-t border-white/[0.06] bg-midnight-900/60 p-6 md:p-10 lg:border-s lg:border-t-0" aria-live="polite">
          {enterprise ? (
            <div className="flex h-full flex-col">
              <Badge tone="signal">Enterprise scale</Badge>
              <p className="mt-5 text-2xl font-semibold text-cloud">{formatNumber(seats)}+ users</p>
              <p className="mt-3 leading-relaxed text-mist">At this scale we build a tailored Enterprise agreement covering dedicated environments, deployment model, integrations and volume economics.</p>
              <div className="mt-auto pt-8">
                <ButtonLink href={`/contact?type=enterprise&users=${seats}`} size="lg" className="w-full" arrow track={{ event: "contact_sales_clicked", props: { location: "calculator" } }}>Talk to Sales</ButtonLink>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <p className="text-sm font-medium text-mist">{getEdition(edition).name} · {formatNumber(seats)} users · {termDef.label}</p>
              <div className="mt-6 space-y-5">
                <dl>
                  <dt className="text-sm text-mist">Price per user / month</dt>
                  <dd className="mt-1 flex flex-wrap items-baseline gap-2">
                    <span className="text-4xl font-semibold tracking-tight text-cloud tabular-nums">{formatMoney(q.pricePerUser, currency)}</span>
                    {q.savingsPercent > 0 && <span className="text-base text-mist line-through tabular-nums">{formatMoney(q.listPricePerUser, currency)}</span>}
                  </dd>
                </dl>
                <dl className="grid grid-cols-2 gap-4 border-t border-white/[0.06] pt-5">
                  <Stat label={termDef.months === 1 ? "Monthly cost" : "Monthly equivalent"} value={formatMoney(q.monthlyCost, currency)} />
                  <Stat label="Annual equivalent" value={formatMoney(q.annualCost, currency)} />
                  <Stat label={termDef.months === 1 ? "Commitment" : `Total contract value (${termDef.months} mo)`} value={termDef.months === 1 ? "Month to month" : formatMoney(q.contractValue, currency)} strong />
                  <Stat label="Total savings vs monthly" value={q.totalSavings > 0 ? `${formatMoney(q.totalSavings, currency)} (${q.savingsPercent}%)` : "—"} accent={q.totalSavings > 0} />
                </dl>
              </div>
              <p className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-mist">
                {termDef.commitment} {termDef.months > 1 && `Savings compare the same users on monthly pricing for ${termDef.months} months.`} Implementation, integrations and usage-based consumption are quoted separately.
              </p>
              <p className="mt-4 text-xs text-mist">Includes: {included.join(", ")}</p>
              <div className="mt-auto grid gap-2 pt-8">
                <ButtonLink href={`/book-demo?edition=${edition}&term=${term}&seats=${seats}`} size="lg" arrow track={{ event: "pricing_cta_clicked", props: { edition, term, seats, cta: "calculator" } }}>Book a Demo</ButtonLink>
                <ButtonLink href={`/contact?edition=${edition}&term=${term}&users=${seats}`} variant="ghost" track={{ event: "contact_sales_clicked", props: { location: "calculator" } }}>Request a formal proposal</ButtonLink>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-mist">{label}</dt>
      <dd className={cn("mt-1 font-semibold tabular-nums", strong ? "text-xl text-cloud" : "text-base text-silver", accent && "text-teal-soft")}>{value}</dd>
    </div>
  );
}
