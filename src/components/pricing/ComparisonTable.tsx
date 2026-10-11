"use client";
import { useState } from "react";
import { comparisonGroups, pricingConfig } from "@/config/pricing";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";

/** Expandable feature comparison — progressive disclosure keeps the pricing screen calm. */
export function ComparisonTable() {
  const [open, setOpen] = useState(false);
  const editions = pricingConfig.editions;
  return (
    <div className="text-center">
      <Button variant="secondary" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="compare-table">
        {open ? "Hide detailed comparison" : "Compare editions in detail"}
        <Icon name="chevronDown" className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>
      <div id="compare-table" hidden={!open} className="mt-10 text-start">
        <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <caption className="sr-only">Feature comparison by edition</caption>
            <thead>
              <tr className="bg-midnight-800/80">
                <th scope="col" className="sticky start-0 bg-midnight-800 px-5 py-4 text-start font-semibold text-cloud">Capability</th>
                {editions.map((e) => <th key={e.id} scope="col" className="px-5 py-4 text-center font-semibold text-cloud">{e.name}</th>)}
              </tr>
            </thead>
            {comparisonGroups.map((g) => (
              <tbody key={g.group}>
                <tr><th scope="colgroup" colSpan={editions.length + 1} className="bg-white/[0.02] px-5 py-2.5 text-start text-xs font-semibold uppercase tracking-[0.14em] text-teal">{g.group}</th></tr>
                {g.rows.map((r) => (
                  <tr key={r.feature} className="border-t border-white/[0.05]">
                    <th scope="row" className="sticky start-0 bg-midnight px-5 py-3.5 text-start font-normal text-silver">{r.feature}</th>
                    {editions.map((e) => {
                      const v = r.values[e.id];
                      return (
                        <td key={e.id} className="px-5 py-3.5 text-center">
                          {v === true ? <><Icon name="check" className="mx-auto h-4 w-4 text-teal" /><span className="sr-only">Included</span></>
                            : v === false ? <><span aria-hidden="true" className="text-mist/50">—</span><span className="sr-only">Not included</span></>
                            : <span className="text-xs text-silver">{v}</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </div>
    </div>
  );
}
