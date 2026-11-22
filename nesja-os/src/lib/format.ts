import { D } from "@/lib/finance";
/** Formats exact numeric strings without passing through floats. */
export function money(v: string | null | undefined, currency = "USD", compact = false): string {
  if (v === null || v === undefined || v === "") return "—";
  const d = new D(v);
  if (compact) {
    const abs = d.abs();
    const [div, suf] = abs.gte(1e9) ? [1e9, "B"] : abs.gte(1e6) ? [1e6, "M"] : abs.gte(1e3) ? [1e3, "K"] : [1, ""];
    return `${d.isNegative() ? "−" : ""}${currency === "USD" ? "$" : currency + " "}${abs.dividedBy(div).toDecimalPlaces(1).toString()}${suf}`;
  }
  const [i, f] = d.abs().toFixed(2).split(".");
  return `${d.isNegative() ? "−" : ""}${currency === "USD" ? "$" : currency + " "}${i.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${f}`;
}
export const pct = (v: string | null | undefined, dp = 1) => (v === null || v === undefined ? "—" : `${new D(v).times(100).toFixed(dp)}%`);
export const date = (v: string | null | undefined) => (v ? new Date(v).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }) : "—");
export const label = (v: string | null | undefined) => (v ? v.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase()) : "—");
