import { pricingConfig } from "@/config/pricing";
import { formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/Section";

/** Pricing components beyond the licence: implementation, integrations and consumption. */
export function AddOns() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {pricingConfig.addOns.map((a) => (
        <div key={a.id} className="surface p-6">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-cloud">{a.name}</h3>
            {a.status === "planned" && <Badge>Roadmap</Badge>}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-mist">{a.description}</p>
          <p className="mt-4 text-sm font-medium text-silver">
            {a.price != null ? `${formatMoney(a.price, pricingConfig.defaultCurrency)}${a.unit ? ` / ${a.unit}` : ""}` : "Scoped to your requirements."}
          </p>
        </div>
      ))}
    </div>
  );
}
