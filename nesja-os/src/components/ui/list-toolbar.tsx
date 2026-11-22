import Link from "next/link";
export function ListToolbar({ q, filters, page, hasMore, base }: { q?: string; filters?: { name: string; value?: string; options: [string, string][] }[]; page: number; hasMore: boolean; base: Record<string, string | undefined> }) {
  const qs = (o: Record<string, string | number | undefined>) => "?" + new URLSearchParams(Object.entries({ ...base, ...o }).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => [k, String(v)])).toString();
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <form className="flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search" aria-label="Search" className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm" />
        {filters?.map((f) => (
          <select key={f.name} name={f.name} defaultValue={f.value ?? ""} aria-label={f.name} className="rounded-lg border border-line bg-surface px-2 py-1.5 text-sm">
            <option value="">All</option>{f.options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        ))}
        <button className="rounded-lg border border-line-strong px-3 py-1.5 text-sm font-semibold hover:bg-hover">Apply</button>
      </form>
      <div className="ms-auto flex gap-2 text-sm">
        {page > 1 && <Link className="text-link" href={qs({ page: page - 1 })}>← Previous</Link>}
        {hasMore && <Link className="text-link" href={qs({ page: page + 1 })}>Next →</Link>}
      </div>
    </div>
  );
}
