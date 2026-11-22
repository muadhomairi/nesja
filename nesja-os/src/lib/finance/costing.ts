/** Manpower costing, resource bundles, mobilisation amortisation and target-margin pricing. */
import { D, type Dec, type DecInput, dec, months, nonNegative, rate, round2, sum } from "./money";

export interface ResourceRole {
  name: string;
  monthlyBaseSalary: DecInput;
  monthlyAllowances?: DecInput;
  /** Employer on-costs (social insurance, benefits) as a fraction of base salary, e.g. "0.175". */
  employerCostRate?: DecInput;
  /** Yearly one-off costs per head (visa, medical, travel), spread evenly over 12 months. */
  annualOneOffCosts?: DecInput;
}

export interface EmployeeCost {
  base: Dec; allowances: Dec; employerCost: Dec; oneOffMonthly: Dec; monthlyCost: Dec;
}

export function employeeMonthlyCost(role: ResourceRole): EmployeeCost {
  const base = nonNegative(role.monthlyBaseSalary, "monthlyBaseSalary");
  const allowances = nonNegative(role.monthlyAllowances ?? 0, "monthlyAllowances");
  const employerRate = nonNegative(role.employerCostRate ?? 0, "employerCostRate");
  if (employerRate.greaterThan(2)) throw new RangeError("employerCostRate above 200% is not plausible");
  const employerCost = round2(base.times(employerRate));
  const oneOffMonthly = round2(nonNegative(role.annualOneOffCosts ?? 0, "annualOneOffCosts").dividedBy(12));
  return { base: round2(base), allowances: round2(allowances), employerCost, oneOffMonthly,
    monthlyCost: round2(base).plus(round2(allowances)).plus(employerCost).plus(oneOffMonthly) };
}

export interface BundleLine { role: ResourceRole; headcount: DecInput; /** share of a full-time person, default 1 */ allocation?: DecInput }

export function bundleMonthlyCost(lines: BundleLine[]): { lines: { name: string; monthly: Dec }[]; monthly: Dec } {
  const out = lines.map((l) => {
    const alloc = dec(l.allocation ?? 1);
    if (alloc.lessThanOrEqualTo(0) || alloc.greaterThan(1)) throw new RangeError("allocation must be in (0, 1]");
    return { name: l.role.name, monthly: round2(employeeMonthlyCost(l.role).monthlyCost.times(nonNegative(l.headcount, "headcount")).times(alloc)) };
  });
  return { lines: out, monthly: sum(out.map((l) => l.monthly)) };
}

/**
 * Spread a one-off amount over n months in whole cents. Every month gets the rounded share and the final month
 * absorbs the rounding remainder, so the schedule always adds back to the exact amount.
 */
export function amortise(amount: DecInput, n: number): Dec[] {
  months(n);
  const total = round2(nonNegative(amount, "amount"));
  const each = round2(total.dividedBy(n));
  const schedule = Array.from({ length: n }, () => each);
  schedule[n - 1] = total.minus(each.times(n - 1));
  return schedule;
}

/** Price that yields the target gross margin on cost: price = cost / (1 - margin). */
export function priceForTargetMargin(cost: DecInput, targetMargin: DecInput): Dec {
  return round2(nonNegative(cost, "cost").dividedBy(new D(1).minus(rate(targetMargin, "targetMargin"))));
}

export function grossMargin(revenue: DecInput, cost: DecInput): { gm: Dec; gmPct: Dec | null } {
  const r = dec(revenue); const c = dec(cost);
  const gm = round2(r.minus(c));
  return { gm, gmPct: r.isZero() ? null : gm.dividedBy(r).toDecimalPlaces(4) };
}
