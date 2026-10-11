import { currencies, type CurrencyCode } from "@/config/locales";

export function formatMoney(value: number, currency: CurrencyCode, opts: { compact?: boolean; exact?: boolean } = {}) {
  const def = currencies[currency];
  const fraction = opts.exact ? 2 : def.fractionDigits;
  return new Intl.NumberFormat(def.formatLocale, {
    style: "currency",
    currency,
    notation: opts.compact ? "compact" : "standard",
    minimumFractionDigits: opts.compact ? 0 : Number.isInteger(value) ? 0 : fraction,
    maximumFractionDigits: opts.compact ? 1 : Math.max(fraction, Number.isInteger(value) ? 0 : 2),
  }).format(value);
}

export const formatNumber = (value: number) => new Intl.NumberFormat("en-US").format(value);
