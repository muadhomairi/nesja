import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { Card, PageHeader } from "@/components/ui/primitives";
import { ResourceWizard } from "./resource-wizard";
export const metadata = { title: "Resource costing" };
export default async function Costing() {
  const { roles, target, cur } = await asUser(async (db, s) => ({ cur: s.org.base_currency,
    roles: await many<{ name: string; monthly_base_salary: string; monthly_allowances: string; employer_cost_rate: string; annual_one_off_costs: string }>(db, "select name, monthly_base_salary, monthly_allowances, employer_cost_rate, annual_one_off_costs from public.resource_roles where tenant_id = $1 order by name", [s.org.id]),
    target: (await many<{ target_margin: string }>(db, "select target_margin from public.rate_cards where tenant_id = $1 order by valid_from desc limit 1", [s.org.id]))[0]?.target_margin ?? "0.25" }), "costing.view");
  return (<>
    <PageHeader title="Resource costing" subtitle="Manpower cost (salary, allowances, employer on-costs, one-offs), bundles, mobilisation amortisation and price at target margin." />
    <Card><ResourceWizard roles={roles} targetMargin={target} currency={cur} /></Card>
  </>);
}
