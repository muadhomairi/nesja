/**
 * Pure pricing engine. All derived values (per-user price, monthly cost,
 * contract value, savings) come from here and from src/config/pricing.ts.
 * Covered by tests/pricing.test.ts.
 */
import { pricingConfig, type ContractTerm, type Edition, type EditionId, type TermId } from "../../config/pricing";
import type { CurrencyCode } from "../../config/locales";

export interface QuoteInput {
  editionId: EditionId;
  termId: TermId;
  seats: number;
  currency?: CurrencyCode;
}

export interface QuoteResult {
  status: "priced" | "custom" | "unavailable";
  edition: Edition;
  term: ContractTerm;
  currency: CurrencyCode;
  seats: number;
  /** Monthly (no-commitment) list price per user — the anchor for savings. */
  listPricePerUser: number;
  /** Effective price per user per month after term and volume discounts. */
  pricePerUser: number;
  /** pricePerUser × seats. */
  monthlyCost: number;
  annualCost: number;
  /** Total value of the committed term (monthlyCost × months). For monthly, one month. */
  contractValue: number;
  /** Savings across the full term versus paying monthly list price. */
  totalSavings: number;
  /** Savings fraction (0–1) versus monthly list price. */
  savingsRate: number;
  /** Display-safe whole-number percentage (floored so it is never overstated). */
  savingsPercent: number;
  volumeDiscount: number;
  exceedsSelfServeRange: boolean;
}

export const getTerm = (id: TermId) => {
  const term = pricingConfig.terms.find((t) => t.id === id);
  if (!term) throw new Error(`Unknown contract term: ${id}`);
  return term;
};

export const getEdition = (id: EditionId) => {
  const edition = pricingConfig.editions.find((e) => e.id === id);
  if (!edition) throw new Error(`Unknown edition: ${id}`);
  return edition;
};

export const clampSeats = (seats: number) => {
  if (!Number.isFinite(seats)) return pricingConfig.minSeats;
  return Math.max(pricingConfig.minSeats, Math.round(seats));
};

export const volumeDiscountFor = (seats: number) =>
  [...pricingConfig.volumeTiers].sort((a, b) => b.minSeats - a.minSeats).find((t) => seats >= t.minSeats)?.discount ?? 0;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Currencies that have a price book for at least one priced edition. */
export const availableCurrencies = (): CurrencyCode[] => {
  const set = new Set<CurrencyCode>();
  pricingConfig.editions.forEach((e) => e.priceBook && (Object.keys(e.priceBook) as CurrencyCode[]).forEach((c) => set.add(c)));
  return [...set];
};

export function calculateQuote(input: QuoteInput): QuoteResult {
  const edition = getEdition(input.editionId);
  const term = getTerm(input.termId);
  const currency = input.currency ?? pricingConfig.defaultCurrency;
  const seats = clampSeats(input.seats);
  const exceedsSelfServeRange = seats >= pricingConfig.enterpriseSeatThreshold;

  const empty = {
    edition, term, currency, seats, listPricePerUser: 0, pricePerUser: 0, monthlyCost: 0, annualCost: 0,
    contractValue: 0, totalSavings: 0, savingsRate: 0, savingsPercent: 0, volumeDiscount: 0, exceedsSelfServeRange,
  };

  if (!edition.priceBook) return { ...empty, status: "custom" };
  const book = edition.priceBook[currency];
  if (!book) return { ...empty, status: "unavailable" };

  const listPricePerUser = book.monthly;
  const volumeDiscount = volumeDiscountFor(seats);
  const pricePerUser = round2(book[term.id] * (1 - volumeDiscount));
  const monthlyCost = round2(pricePerUser * seats);
  const contractValue = round2(monthlyCost * term.months);
  const listContractValue = listPricePerUser * seats * term.months;
  const totalSavings = round2(listContractValue - contractValue);
  const savingsRate = listPricePerUser > 0 ? 1 - pricePerUser / listPricePerUser : 0;

  return {
    ...empty,
    status: "priced",
    listPricePerUser,
    pricePerUser,
    monthlyCost,
    annualCost: round2(monthlyCost * 12),
    contractValue,
    totalSavings,
    savingsRate,
    savingsPercent: Math.floor(savingsRate * 100 + 1e-9),
    volumeDiscount,
  };
}

/** Per-term savings badges ("Save 15%") derived from the price book. */
export function termSavingsPercent(editionId: EditionId, termId: TermId, currency: CurrencyCode = pricingConfig.defaultCurrency) {
  return calculateQuote({ editionId, termId, seats: 1, currency }).savingsPercent;
}

/** Lowest advertised per-user price for an edition (used for "from" labels). */
export function startingPrice(editionId: EditionId, currency: CurrencyCode = pricingConfig.defaultCurrency) {
  const book = getEdition(editionId).priceBook?.[currency];
  if (!book) return null;
  const termId = (Object.entries(book) as [TermId, number][]).sort((a, b) => a[1] - b[1])[0][0];
  return { price: book[termId], term: getTerm(termId) };
}
