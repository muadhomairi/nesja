"use client";
import { useMemo, useState } from "react";
import { amortise, bundleMonthlyCost, employeeMonthlyCost, fmt2, multiYearSchedule, priceForTargetMargin, D } from "@/lib/finance";
type R = { name: string; monthly_base_salary: string; monthly_allowances: string; employer_cost_rate: string; annual_one_off_costs: string };
export function ResourceWizard({ roles, targetMargin, currency }: { roles: R[]; targetMargin: string; currency: string }) {
  const [heads, setHeads] = useState<Record<string, string>>({});
  const [term, setTerm] = useState("36");
  const [mob, setMob] = useState("0");
  const [margin, setMargin] = useState(String(Number(targetMargin) * 100));
  const [esc, setEsc] = useState("3");
  const r = useMemo(() => {
    try {
      const lines = roles.filter((x) => Number(heads[x.name] || 0) > 0).map((x) => ({ role: { name: x.name, monthlyBaseSalary: x.monthly_base_salary, monthlyAllowances: x.monthly_allowances, employerCostRate: x.employer_cost_rate, annualOneOffCosts: x.annual_one_off_costs }, headcount: heads[x.name] }));
      const b = bundleMonthlyCost(lines); const n = Number(term);
      const mobMonthly = amortise(mob || "0", n)[0];
      const monthlyCost = b.monthly.plus(mobMonthly);
      const price = priceForTargetMargin(monthlyCost, (Number(margin) / 100).toFixed(4));
      const years = Math.max(1, Math.ceil(n / 12));
      return { b, monthlyCost, price, my: multiYearSchedule(price, years, (Number(esc) / 100).toFixed(4)) };
    } catch (e) { return e as Error; }
  }, [roles, heads, term, mob, margin, esc]);
  const inp = "w-24 rounded border border-line bg-surface px-2 py-1 text-sm tabular";
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3 text-sm">
        <h3 className="font-semibold">1 · Team</h3>
        <table className="w-full"><thead className="text-xs text-muted"><tr><th className="text-start">Role</th><th className="text-end">Cost / head / month</th><th className="text-end">Headcount</th></tr></thead>
          <tbody>{roles.map((x) => <tr key={x.name}><td>{x.name}</td><td className="text-end tabular">{fmt2(employeeMonthlyCost({ name: x.name, monthlyBaseSalary: x.monthly_base_salary, monthlyAllowances: x.monthly_allowances, employerCostRate: x.employer_cost_rate, annualOneOffCosts: x.annual_one_off_costs }).monthlyCost)}</td>
            <td className="text-end"><input aria-label={`${x.name} headcount`} className={inp} value={heads[x.name] ?? ""} onChange={(e) => /^\d{0,4}(\.\d{0,2})?$/.test(e.target.value) && setHeads({ ...heads, [x.name]: e.target.value })} /></td></tr>)}</tbody></table>
        {!roles.length && <p className="text-muted">No resource roles yet. An administrator adds them under Administration.</p>}
        <h3 className="pt-2 font-semibold">2 · Terms</h3>
        <div className="flex flex-wrap gap-3">
          <label>Term (months) <input className={inp} value={term} onChange={(e) => /^\d{0,3}$/.test(e.target.value) && setTerm(e.target.value)} /></label>
          <label>Mobilisation <input className={inp} value={mob} onChange={(e) => /^\d{0,10}(\.\d{0,2})?$/.test(e.target.value) && setMob(e.target.value)} /></label>
          <label>Target margin % <input className={inp} value={margin} onChange={(e) => /^\d{0,2}(\.\d{0,2})?$/.test(e.target.value) && setMargin(e.target.value)} /></label>
          <label>Yearly escalation % <input className={inp} value={esc} onChange={(e) => /^\d{0,2}(\.\d{0,2})?$/.test(e.target.value) && setEsc(e.target.value)} /></label>
        </div>
      </div>
      <div className="space-y-3 text-sm">
        <h3 className="font-semibold">3 · Result</h3>
        {r instanceof Error ? <p className="text-bad">{r.message}</p> : (<>
          <dl className="grid grid-cols-2 gap-2 rounded-lg bg-surface-2 p-3">
            <div><dt className="text-xs text-muted">Team cost / month</dt><dd className="font-semibold tabular">{currency} {fmt2(r.b.monthly)}</dd></div>
            <div><dt className="text-xs text-muted">Incl. amortised mobilisation</dt><dd className="font-semibold tabular">{currency} {fmt2(r.monthlyCost)}</dd></div>
            <div><dt className="text-xs text-muted">Monthly price at target margin</dt><dd className="font-semibold tabular">{currency} {fmt2(r.price)}</dd></div>
            <div><dt className="text-xs text-muted">Multi-year TCV</dt><dd className="font-semibold tabular">{currency} {r.my.tcv}</dd></div>
          </dl>
          <table className="w-full"><thead className="text-xs text-muted"><tr><th className="text-start">Year</th><th className="text-end">Monthly fee</th><th className="text-end">Annual</th></tr></thead>
            <tbody>{r.my.rows.map((y) => <tr key={y.year}><td>Year {y.year}</td><td className="text-end tabular">{y.monthlyFee}</td><td className="text-end tabular">{y.annual}</td></tr>)}</tbody></table>
          <p className="text-xs text-muted">Every figure uses exact decimals; the same engine prices quotations{new D(r.price).isZero() ? "" : ""}.</p>
        </>)}
      </div>
    </div>
  );
}
