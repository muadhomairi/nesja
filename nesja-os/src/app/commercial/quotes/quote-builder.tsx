"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { fmt2, priceQuote, type PricingModel } from "@/lib/finance";
import { Notice } from "@/components/ui/primitives";
import { saveQuote } from "@/app/actions/commercial";

type L = { description: string; pricing_model: PricingModel; quantity: string; unit_price: string; unit_cost: string; discount: string };
const num = /^\d{0,12}(\.\d{0,4})?$/;

/** Live CPQ preview with the same decimal engine the database mirrors; the saved figures are recomputed in SQL. */
export function QuoteBuilder({ opportunityId, currency, termMonths, catalogue, showCost }: { opportunityId: string; currency: string; termMonths: number; showCost: boolean;
  catalogue: { code: string; description: string; pricing_model: string; unit_price: string; unit_cost: string }[] }) {
  const router = useRouter();
  const [term, setTerm] = useState(String(termMonths));
  const [disc, setDisc] = useState("0");
  const [mob, setMob] = useState("0");
  const [lines, setLines] = useState<L[]>([{ description: "", pricing_model: "recurring", quantity: "1", unit_price: "0", unit_cost: "0", discount: "0" }]);
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const result = useMemo(() => {
    try {
      return priceQuote({ termMonths: Number(term), overallDiscountRate: String(Number(disc || 0) / 100), mobilisationCost: mob || "0",
        lines: lines.map((l) => ({ description: l.description, pricingModel: l.pricing_model, quantity: l.quantity || "0", unitPrice: l.unit_price || "0", unitCost: l.unit_cost || "0", discountRate: String(Number(l.discount || 0) / 100) })) });
    } catch (e) { return e as Error; }
  }, [term, disc, mob, lines]);
  const set = (i: number, k: keyof L, v: string) => setLines((ls) => ls.map((l, j) => (j === i ? { ...l, [k]: v } : l)));
  const cell = "w-full rounded border border-line bg-surface px-2 py-1 text-sm tabular";
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-3">
        <label>Term (months) <input className={cell} value={term} onChange={(e) => /^\d{0,3}$/.test(e.target.value) && setTerm(e.target.value)} /></label>
        <label>Overall discount % <input className={cell} value={disc} onChange={(e) => num.test(e.target.value) && setDisc(e.target.value)} /></label>
        <label>Mobilisation cost <input className={cell} value={mob} onChange={(e) => num.test(e.target.value) && setMob(e.target.value)} /></label>
        {catalogue.length > 0 && <label>Add from rate card <select className={cell} value="" onChange={(e) => { const c = catalogue.find((x) => x.code === e.target.value); if (c) setLines((ls) => [...ls, { description: c.description, pricing_model: c.pricing_model as PricingModel, quantity: "1", unit_price: c.unit_price, unit_cost: c.unit_cost, discount: "0" }]); }}>
          <option value="">Choose…</option>{catalogue.map((c) => <option key={c.code} value={c.code}>{c.code} · {c.description}</option>)}</select></label>}
      </div>
      <div className="overflow-x-auto"><table className="w-full">
        <thead className="text-xs text-muted"><tr><th className="text-start">Description</th><th>Model</th><th>Qty / month vol.</th><th>Unit price</th>{showCost && <th>Unit cost</th>}<th>Disc. %</th><th className="text-end">Revenue</th><th /></tr></thead>
        <tbody>{lines.map((l, i) => (
          <tr key={i}>
            <td><input aria-label="Description" className={cell} value={l.description} onChange={(e) => set(i, "description", e.target.value)} /></td>
            <td><select aria-label="Pricing model" className={cell} value={l.pricing_model} onChange={(e) => set(i, "pricing_model", e.target.value)}><option value="one_time">One-time</option><option value="recurring">Recurring</option><option value="transactional">Transactional</option></select></td>
            {(["quantity", "unit_price", ...(showCost ? ["unit_cost"] : []), "discount"] as (keyof L)[]).map((k) => <td key={k}><input aria-label={k} className={cell} value={l[k]} onChange={(e) => num.test(e.target.value) && set(i, k, e.target.value)} /></td>)}
            <td className="text-end tabular">{result instanceof Error ? "—" : fmt2(result.lines[i]?.revenue ?? "0")}</td>
            <td><button aria-label="Remove line" onClick={() => setLines((ls) => ls.filter((_, j) => j !== i))} className="p-1 text-muted hover:text-bad"><Trash2 className="h-4 w-4" /></button></td>
          </tr>))}</tbody>
      </table></div>
      <button onClick={() => setLines((ls) => [...ls, { description: "", pricing_model: "recurring", quantity: "1", unit_price: "0", unit_cost: "0", discount: "0" }])} className="inline-flex items-center gap-1 text-link"><Plus className="h-4 w-4" />Add line</button>
      {result instanceof Error ? <Notice tone="bad">{result.message}</Notice> : (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-lg bg-surface-2 p-3 sm:grid-cols-4">
          {[["One-time", result.oneTimeRevenue], ["Recurring", result.recurringRevenue], ["Transactional", result.transactionalRevenue], ["Overall discount", result.overallDiscount],
            ["TCV", result.tcv], ["ACV", result.acv], ["Monthly recurring", result.monthlyRecurring], ...(showCost ? [["Total cost", result.totalCost], ["Gross margin", result.gm]] as const : [])].map(([k, v]) =>
            <div key={String(k)}><dt className="text-xs text-muted">{String(k)}</dt><dd className="font-semibold tabular">{currency} {fmt2(v as never)}</dd></div>)}
          {showCost && <div><dt className="text-xs text-muted">GM %</dt><dd className="font-semibold tabular">{result.gmPct ? (Number(result.gmPct) * 100).toFixed(1) + "%" : "—"}</dd></div>}
        </dl>)}
      {err && <Notice tone="bad">{err}</Notice>}
      <button disabled={pending || result instanceof Error} onClick={() => start(async () => {
        const r = await saveQuote({ opportunityId, termMonths: Number(term), overallDiscountRate: (Number(disc || 0) / 100).toFixed(6), mobilisationCost: mob || "0",
          lines: lines.map((l) => ({ description: l.description || "Line", pricing_model: l.pricing_model, quantity: l.quantity || "0", unit_price: l.unit_price || "0", unit_cost: l.unit_cost || "0", discount_rate: (Number(l.discount || 0) / 100).toFixed(6) })) });
        if (r.error) setErr(r.error); else router.push(`/commercial/quotes/${r.id}`);
      })} className="rounded-lg bg-brand-500 px-4 py-2 font-semibold text-on-brand disabled:opacity-50">{pending ? "Saving…" : "Save draft quotation"}</button>
    </div>
  );
}
