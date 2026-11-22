/**
 * Exact decimal arithmetic for every commercial figure. Never use JavaScript numbers for money:
 * values enter as strings or Decimals and leave as fixed 2-dp strings. Rounding is half away from zero,
 * which is what PostgreSQL round(numeric, 2) does, so the app and the database always agree.
 */
import Decimal from "decimal.js";

export const D = Decimal.clone({ precision: 40, rounding: Decimal.ROUND_HALF_UP });
export type Dec = InstanceType<typeof D>;
export type DecInput = Dec | string | number;

export function dec(v: DecInput): Dec {
  if (typeof v === "number" && !Number.isInteger(v)) {
    throw new TypeError(`Pass fractional money as a string, not the float ${v}`);
  }
  const d = new D(v);
  if (!d.isFinite()) throw new RangeError(`Not a finite amount: ${String(v)}`);
  return d;
}

export const round2 = (v: DecInput): Dec => dec(v).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
export const fmt2 = (v: DecInput): string => round2(v).toFixed(2);
export const sum = (vs: DecInput[]): Dec => vs.reduce<Dec>((a, v) => a.plus(dec(v)), new D(0));

export function rate(v: DecInput, name = "rate"): Dec {
  const r = dec(v);
  if (r.isNegative() || r.greaterThanOrEqualTo(1)) throw new RangeError(`${name} must be in [0, 1): ${r.toString()}`);
  return r;
}

export function nonNegative(v: DecInput, name: string): Dec {
  const d = dec(v);
  if (d.isNegative()) throw new RangeError(`${name} cannot be negative: ${d.toString()}`);
  return d;
}

export function months(v: number, name = "months"): number {
  if (!Number.isInteger(v) || v < 1 || v > 120) throw new RangeError(`${name} must be a whole number from 1 to 120`);
  return v;
}
