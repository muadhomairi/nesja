import { requireOrg } from "@/lib/server/session";
import { integrations } from "@/lib/integrations";
import { Badge, Card, Notice, PageHeader } from "@/components/ui/primitives";

export const metadata = { title: "NESJA assistant" };
export default async function Assistant() {
  await requireOrg("ai.use");
  const ai = integrations().find((i) => i.key === "ai")!;
  return (<>
    <PageHeader title="NESJA assistant" subtitle="Questions about your pipeline, quotations and contracts, answered from records you are allowed to see." />
    <Notice tone="warn"><b>Not configured.</b> No AI provider is connected, so the assistant is switched off. It shows no sample or simulated answers.</Notice>
    <div className="mt-4 grid gap-3 lg:grid-cols-2">
      <Card title="How it will work" action={<Badge tone="neutral">Architecture</Badge>}>
        <ol className="list-decimal space-y-1.5 ps-5 text-sm">
          <li>Your question goes to the NESJA server, never straight from the browser to the AI provider.</li>
          <li>The server reads records as you, so row-level security and your record scope limit what the assistant can see.</li>
          <li>Only the records needed for the answer are sent to the provider, and the provider key stays on the server.</li>
          <li>Every answer cites the records it used, with links, and is labelled as AI-generated.</li>
          <li>Each request is written to the audit log with actor type “ai”. The assistant can draft, but never approves, issues or changes a record by itself.</li>
        </ol>
      </Card>
      <Card title="Configuration" action={<Badge tone="neutral">Not configured</Badge>}>
        <p className="text-sm text-muted">{ai.detail}</p>
        <p className="mt-2 text-sm">To switch it on, an administrator sets these on the server:</p>
        <ul className="mt-1 list-disc ps-5 text-sm">{ai.needs.map((n) => <li key={n}><code>{n}</code></li>)}</ul>
        <p className="mt-2 text-xs text-muted">Permission: <code>ai.use</code>. Usage is metered per tenant in usage events.</p>
      </Card>
    </div>
  </>);
}
