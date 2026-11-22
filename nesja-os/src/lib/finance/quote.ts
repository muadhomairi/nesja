/**
 * CPQ arithmetic. Mirrors the database exactly (quote_lines generated columns and the quote_totals view),
 * and tests/finance.test.ts plus the SQL test assert the same figures, so UI previews equal stored totals.
 */
import { type Dec, type DecInput, dec, fmt2, months, nonNegative, rate, round2, sum } from "./money";
import { amortise, grossMargin } from "./costing";

export type PricingModel = "one_time" | "recurring" | "transactional";

export interface QuoteLineInput {
  description: string;
  pricingModel: PricingModel;
  /** Units, or expected monthly volume for transactional lines. */
  quantity: DecInput;
  unitPrice: DecInput;
  unitCost?: DecInput;
  discountRate?: DecInput;
}

export interface QuoteInput {
  termMonths: number;
  overallDiscountRate?: DecInput;
  mobilisationCost?: DecInput;
  lines: QuoteLineInput[];
}

export interface QuoteLineResult { description: string; pricingModel: PricingModel; billingMonths: number; revenue: Dec; cost: Dec }

export interface QuoteResult {
  lines: QuoteLineResult[];
  oneTimeRevenue: Dec; recurringRevenue: Dec; transactionalRevenue: Dec;
  grossRevenue: Dec; overallDiscount: Dec; tcv: Dec; acv: Dec; totalCost: Dec;
  mobilisationSchedule: Dec[]; gm: Dec; gmPct: Dec | null; monthlyRecurring: Dec;
}

export function priceQuote(q: QuoteInput): QuoteResult {
  const term = months(q.termMonths, "termMonths");
  const lines = q.lines.map<QuoteLineResult>((l) => {
    const billingMonths = l.pricingModel === "one_time" ? 1 : term;
    const qty = nonNegative(l.quantity, "quantity");
    const price = nonNegative(l.unitPrice, "unitPrice");
    const disc = rate(l.discountRate ?? 0, "discountRate");
    return {
      description: l.description, pricingModel: l.pricingModel, billingMonths,
      revenue: round2(qty.times(price).times(dec(1).minus(disc)).times(billingMonths)),
      cost: round2(qty.times(nonNegative(l.unitCost ?? 0, "unitCost")).times(billingMonths)),
    };
  });
  const by = (m: PricingModel) => sum(lines.filter((l) => l.pricingModel === m).map((l) => l.revenue));
  const grossRevenue = sum(lines.map((l) => l.revenue));
  const overallDiscount = round2(grossRevenue.times(rate(q.overallDiscountRate ?? 0, "overallDiscountRate")));
  const tcv = grossRevenue.minus(overallDiscount);
  const mobilisation = round2(nonNegative(q.mobilisationCost ?? 0, "mobilisationCost"));
  const totalCost = sum(lines.map((l) => l.cost)).plus(mobilisation);
  const { gm, gmPct } = grossMargin(tcv, totalCost);
  const monthlyRecurring = round2(sum(lines.filter((l) => l.pricingModel !== "one_time").map((l) => l.revenue)).dividedBy(term));
  return {
    lines, oneTimeRevenue: by("one_time"), recurringRevenue: by("recurring"), transactionalRevenue: by("transactional"),
    grossRevenue, overallDiscount, tcv, acv: round2(tcv.times(12).dividedBy(term)), totalCost,
    mobilisationSchedule: amortise(mobilisation, term), gm, gmPct, monthlyRecurring,
  };
}

/** Multi-year schedule with a yearly price escalation applied to the monthly recurring fee. */
export function multiYearSchedule(monthlyFee: DecInput, years: number, escalationRate: DecInput = 0) {
  if (!Number.isInteger(years) || years < 1 || years > 10) throw new RangeError("years must be 1–10");
  const esc = nonNegative(escalationRate, "escalationRate");
  let fee = round2(monthlyFee);
  const rows: { year: number; monthlyFee: string; annual: string }[] = [];
  let tcv = dec(0);
  for (let y = 1; y <= years; y++) {
    if (y > 1) fee = round2(fee.times(dec(1).plus(esc)));
    const annual = fee.times(12);
    tcv = tcv.plus(annual);
    rows.push({ year: y, monthlyFee: fmt2(fee), annual: fmt2(annual) });
  }
  return { rows, tcv: fmt2(tcv), acv: fmt2(tcv.dividedBy(years)) };
}
