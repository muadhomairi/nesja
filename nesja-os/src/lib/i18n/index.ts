/** English + Arabic-ready dictionary. Layout sets dir="rtl" for Arabic; components use logical (start/end) spacing. */
import { cookies } from "next/headers";
export type Locale = "en" | "ar";
const en = {
  "nav.home": "Command center", "nav.accounts": "Accounts", "nav.leads": "Leads", "nav.opportunities": "Opportunities", "nav.quotes": "Quotations",
  "nav.costing": "Resource costing", "nav.tenders": "Tenders & bids", "nav.agreements": "Agreements", "nav.renewals": "Renewals",
  "nav.approvals": "Approvals", "nav.performance": "MIS & performance", "nav.activities": "Activities", "nav.documents": "Documents & sales kit",
  "nav.admin": "Administration", "nav.launcher": "All products", "nav.demo": "Demo journeys",
  "group.sell": "Sell", "group.price": "Price & bid", "group.contract": "Contract & grow", "group.insight": "Insight", "group.org": "Organization",
} as const;
type Key = keyof typeof en;
const ar: Partial<Record<Key, string>> = {
  "nav.home": "مركز القيادة", "nav.accounts": "الحسابات", "nav.leads": "العملاء المحتملون", "nav.opportunities": "الفرص", "nav.quotes": "عروض الأسعار",
  "nav.costing": "تكلفة الموارد", "nav.tenders": "المناقصات", "nav.agreements": "الاتفاقيات", "nav.renewals": "التجديدات", "nav.approvals": "الموافقات",
  "nav.performance": "الأداء", "nav.activities": "الأنشطة", "nav.documents": "المستندات", "nav.admin": "الإدارة", "nav.launcher": "كل المنتجات", "nav.demo": "رحلات العرض",
  "group.sell": "البيع", "group.price": "التسعير", "group.contract": "العقود والنمو", "group.insight": "التحليلات", "group.org": "المؤسسة",
};
export async function getLocale(): Promise<Locale> { return (await cookies()).get("nesja_locale")?.value === "ar" ? "ar" : "en"; }
export async function getT() { const l = await getLocale(); return (k: Key) => (l === "ar" ? ar[k] ?? en[k] : en[k]); }
export type TKey = Key;
