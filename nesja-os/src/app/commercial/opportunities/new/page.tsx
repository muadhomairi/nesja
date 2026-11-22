import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { ActionForm } from "@/components/forms/action-form";
import { Card, Field, Input, PageHeader, Select } from "@/components/ui/primitives";
import { createOpportunity } from "@/app/actions/commercial";
export const metadata = { title: "New opportunity" };
export default async function NewOpp({ searchParams }: { searchParams: Promise<{ account?: string }> }) {
  const sp = await searchParams;
  const accounts = await asUser((db, s) => many<{ id: string; name: string }>(db, "select id, name from public.accounts where tenant_id = $1 and archived_at is null order by name limit 1000", [s.org.id]), "opportunity.create");
  return (<>
    <PageHeader title="New opportunity" />
    <Card className="max-w-xl">
      <ActionForm action={createOpportunity} submit="Create opportunity">
        <Field label="Name" htmlFor="name"><Input id="name" name="name" required /></Field>
        <Field label="Account" htmlFor="account_id"><Select id="account_id" name="account_id" defaultValue={sp.account} required>{accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</Select></Field>
        <Field label="Revenue type" htmlFor="revenue_type"><Select id="revenue_type" name="revenue_type"><option value="new_business">New business</option><option value="expansion">Expansion</option><option value="renewal">Renewal</option></Select></Field>
        <Field label="Estimated TCV" htmlFor="tcv" hint="Replaced by the quotation total once you price it."><Input id="tcv" name="tcv" inputMode="decimal" defaultValue="0" pattern="\d+(\.\d{1,2})?" /></Field>
        <Field label="Term (months)" htmlFor="term_months"><Input id="term_months" name="term_months" type="number" min={1} max={120} defaultValue={36} /></Field>
        <Field label="Expected close" htmlFor="expected_close"><Input id="expected_close" name="expected_close" type="date" required /></Field>
      </ActionForm>
    </Card>
  </>);
}
