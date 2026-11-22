import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { like, paging, type ListParams } from "@/lib/server/list";
import { DataTable } from "@/components/ui/data-table";
import { ListToolbar } from "@/components/ui/list-toolbar";
import { Card, PageHeader, Select } from "@/components/ui/primitives";
import { ActionForm } from "@/components/forms/action-form";
import { date, label } from "@/lib/format";
import { uploadDocument } from "@/app/actions/documents";
import { DownloadButton } from "./download";
const CAT = ["proposal", "quotation", "agreement", "tender", "sales_kit", "template", "other"];
export const metadata = { title: "Documents & sales kit" };
export default async function Documents({ searchParams }: { searchParams: Promise<ListParams> }) {
  const sp = await searchParams; const pg = paging(sp);
  const { rows, canUpload } = await asUser(async (db, s) => ({ canUpload: s.can("document.create"), rows: await many<Record<string, string>>(db, `
    select d.id, d.name, d.category, d.mime_type, d.size_bytes, d.created_at, coalesce(p.full_name, p.email) as owner from public.documents d left join public.profiles p on p.user_id = d.owner_id
    where d.tenant_id = $1 and ($2::text is null or d.name ilike $2) and ($3::text is null or d.category = $3) order by d.created_at desc limit $4 offset $5`,
    [s.org.id, like(sp.q), CAT.includes(sp.category ?? "") ? sp.category : null, pg.limit + 1, pg.offset]) }), "document.view");
  return (<>
    <PageHeader title="Documents & sales kit" subtitle="Files are stored privately under your organization's own storage prefix and opened through 60-second links." />
    {canUpload && <Card className="mb-4" title="Upload"><ActionForm action={uploadDocument} submit="Upload"><div className="flex flex-wrap gap-3"><input type="file" name="file" required className="text-sm" /><Select name="category" aria-label="Category" className="w-auto">{CAT.map((c) => <option key={c} value={c}>{label(c)}</option>)}</Select></div></ActionForm></Card>}
    <ListToolbar q={sp.q} page={pg.page} hasMore={rows.length > pg.limit} base={{ q: sp.q, category: sp.category }} filters={[{ name: "category", value: sp.category, options: CAT.map((c) => [c, label(c)]) }]} />
    <DataTable rows={rows.slice(0, pg.limit)} columns={[
      { key: "n", header: "Name", cell: (r) => r.name }, { key: "c", header: "Category", cell: (r) => label(r.category) }, { key: "s", header: "Size", align: "end", cell: (r) => `${(Number(r.size_bytes) / 1024 / 1024).toFixed(1)} MB` },
      { key: "o", header: "Owner", cell: (r) => r.owner ?? "—" }, { key: "d", header: "Added", cell: (r) => date(r.created_at) }, { key: "x", header: "", cell: (r) => <DownloadButton id={r.id} /> }]} />
  </>);
}
