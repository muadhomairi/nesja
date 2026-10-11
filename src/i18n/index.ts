/**
 * i18n entry point. Today the site renders the default locale. To launch
 * Arabic: enable it in src/config/locales.ts, move routes under
 * src/app/[locale]/, and resolve the locale in middleware from the URL
 * prefix (/ar/...). Components already use logical CSS properties
 * (ms-/me-/ps-/pe-/start/end) so RTL layouts render correctly.
 */
import { defaultLocale, getLocale, type LocaleCode } from "@/config/locales";
import { en, type Dictionary } from "./dictionaries/en";
import { ar } from "./dictionaries/ar";

const dictionaries: Record<LocaleCode, Dictionary> = { en, ar };

export const getDictionary = (locale: LocaleCode = defaultLocale): Dictionary => dictionaries[locale] ?? en;
export const getDirection = (locale: LocaleCode = defaultLocale) => getLocale(locale).dir;
export { defaultLocale };
