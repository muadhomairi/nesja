import Link from "next/link";
import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { AppShell } from "@/components/shell/app-shell";
import { Empty, PageHeader } from "@/components/ui/primitives";
import { requireOrg } from "@/lib/server/session";

export const metadata = { title: "Demo journeys" };
export default async function Journeys() {
  const s = await requireOrg();
  const journeys = await asUser((db, s) => many<{ key: string; position: number; title: string; summary: string; steps: { label: string; href: string }[] }>(db,
    "select key, position, title, summary, steps from public.demo_journeys where tenant_id = $1 order by position", [s.org.id]));
  return (
    <AppShell session={s}>
      <PageHeader title="Demonstration journeys" subtitle="Six end-to-end stories through real records in the Northstar demo data." />
      {!journeys.length ? <Empty title="No journeys in this organization">Journeys exist only in the demonstration environment.</Empty> : (
        <ol className="grid gap-4 md:grid-cols-2">
          {journeys.map((j) => (
            <li key={j.key} className="card p-5">
              <p className="text-xs font-semibold text-brand-700 dark:text-brand-300">Journey {j.position}</p>
              <h2 className="mt-1 font-display text-lg font-semibold">{j.title}</h2>
              <p className="mt-1 text-sm text-muted">{j.summary}</p>
              <ol className="mt-4 flex flex-wrap gap-2">
                {j.steps.map((st, i) => <li key={i}><Link href={st.href} className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs font-medium hover:border-brand-500"><span className="text-subtle">{i + 1}</span>{st.label}</Link></li>)}
              </ol>
            </li>
          ))}
        </ol>
      )}
    </AppShell>
  );
}
