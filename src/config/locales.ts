/**
 * Internationalisation + currency configuration.
 * English ships first. Arabic is prepared (RTL direction, dictionary file) and
 * switches on via `enabled: true` once the content has been professionally
 * written for Arabic readers, not machine-mirrored from English.
 */
export type LocaleCode = "en" | "ar";
export type Direction = "ltr" | "rtl";

export interface LocaleDefinition {
  code: LocaleCode;
  label: string;
  nativeLabel: string;
  dir: Direction;
  htmlLang: string;
  enabled: boolean;
}

export const locales: LocaleDefinition[] = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr", htmlLang: "en", enabled: true },
  { code: "ar", label: "Arabic", nativeLabel: "العربية", dir: "rtl", htmlLang: "ar", enabled: false },
];

export const defaultLocale: LocaleCode = "en";
export const getLocale = (code: LocaleCode) => locales.find((l) => l.code === code) ?? locales[0];

export type CurrencyCode = "USD" | "OMR" | "AED" | "SAR" | "GBP" | "EUR";

export interface CurrencyDefinition {
  code: CurrencyCode;
  label: string;
  /** Intl locale used for formatting. */
  formatLocale: string;
  /** Decimal places shown for per-user prices (OMR uses 3 minor units). */
  fractionDigits: number;
}

export const currencies: Record<CurrencyCode, CurrencyDefinition> = {
  USD: { code: "USD", label: "US Dollar", formatLocale: "en-US", fractionDigits: 0 },
  OMR: { code: "OMR", label: "Omani Rial", formatLocale: "en-OM", fractionDigits: 1 },
  AED: { code: "AED", label: "UAE Dirham", formatLocale: "en-AE", fractionDigits: 0 },
  SAR: { code: "SAR", label: "Saudi Riyal", formatLocale: "en-SA", fractionDigits: 0 },
  GBP: { code: "GBP", label: "British Pound", formatLocale: "en-GB", fractionDigits: 0 },
  EUR: { code: "EUR", label: "Euro", formatLocale: "en-IE", fractionDigits: 0 },
};
