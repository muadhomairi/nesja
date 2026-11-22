import Link from "next/link";
import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { like } from "@/lib/server/list";
import { Card, Empty, PageHeader } from "@/components/ui/primitives";
export const metadata = { title: "Search" };
/** Search across modules. RLS limits every result to records the user may see. */
export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const pat = like(q?.trim());
  const groups = pat ? await asUser(async (db, s) => {
    const t = s.org.id; const out: { title: string; rows: { id: string; label: string; href: string }[] }[] = [];
    if (s.can("account.view")) out.push({ title: "Accounts", rows: (await many<{ id: string; name: string }>(db, "select id, name from public.accounts where tenant_id = $1 and (name ilike $2 or number ilike $2) limit 10", [t, pat])).map((r) => ({ id: r.id, label: r.name, href: `/commercial/accounts/${r.id}` })) });
    if (s.can("opportunity.view")) out.push({ title: "Opportunities", rows: (await many<{ id: string; name: string }>(db, "select id, name from public.opportunities where tenant_id = $1 and (name ilike $2 or number ilike $2) limit 10", [t, pat])).map((r) => ({ id: r.id, label: r.name, href: `/commercial/opportunities/${r.id}` })) });
    if (s.can("quote.view")) out.push({ title: "Quotations", rows: (await many<{ id: string; number: string; revision: number }>(db, "select id, number, revision from public.quotes where tenant_id = $1 and number ilike $2 limit 10", [t, pat])).map((r) => ({ id: r.id, label: `${r.number} rev ${r.revision}`, href: `/commercial/quotes/${r.id}` })) });
    if (s.can("agreement.view")) out.push({ title: "Agreements", rows: (await many<{ id: string; title: string }>(db, "select id, title from public.agreements where tenant_id = $1 and (title ilike $2 or number ilike $2) limit 10", [t, pat])).map((r) => ({ id: r.id, label: r.title, href: `/commercial/agreements/${r.id}` })) });
    return out.filter((g) => g.rows.length);
  }) : [];
  return (<>
    <PageHeader title={q ? `Results for “${q}”` : "Search"} />
    {!groups.length ? <Empty title={q ? "Nothing found" : "Type in the search box above"} /> : <div className="grid gap-4 md:grid-cols-2">{groups.map((g) => <Card key={g.title} title={g.title}><ul className="space-y-1 text-sm">{g.rows.map((r) => <li key={r.id}><Link href={r.href} className="text-link hover:underline">{r.label}</Link></li>)}</ul></Card>)}</div>}
  </>);
}
