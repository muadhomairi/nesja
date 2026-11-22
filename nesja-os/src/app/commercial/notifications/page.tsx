import Link from "next/link";
import { asUser } from "@/lib/server/session";
import { many } from "@/lib/server/db";
import { Empty, PageHeader } from "@/components/ui/primitives";
import { date } from "@/lib/format";
import { markNotificationsRead } from "@/app/actions/commercial";
export const metadata = { title: "Notifications" };
export default async function Notifications() {
  const rows = await asUser((db, s) => many<Record<string, string>>(db, "select title, body, link, read_at, created_at from public.notifications where tenant_id = $1 and user_id = auth.uid() order by created_at desc limit 100", [s.org.id]));
  return (<>
    <PageHeader title="Notifications" actions={<form action={markNotificationsRead}><button className="rounded-lg border border-line-strong px-3 py-1.5 text-sm font-semibold hover:bg-hover">Mark all read</button></form>} />
    {!rows.length ? <Empty title="You're all caught up" /> : <ul className="card divide-y divide-line">{rows.map((n, i) => (
      <li key={i} className="flex items-start gap-3 px-4 py-3">{!n.read_at && <span className="mt-1.5 h-2 w-2 rounded-full bg-brand-500" aria-label="Unread" />}
        <div className="min-w-0 flex-1"><Link href={n.link ?? "#"} className="font-medium hover:underline">{n.title}</Link>{n.body && <p className="text-sm text-muted">{n.body}</p>}</div>
        <span className="text-xs text-muted">{date(n.created_at)}</span></li>))}</ul>}
  </>);
}
