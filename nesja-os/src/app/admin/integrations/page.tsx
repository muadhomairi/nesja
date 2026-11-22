import { requireOrg } from "@/lib/server/session";
import { integrations } from "@/lib/integrations";
import { Badge, Card, PageHeader } from "@/components/ui/primitives";

const BADGE = { active: ["ok", "Active"], ready: ["warn", "Integration-ready"], blocked: ["neutral", "Not configured"] } as const;
export const metadata = { title: "Integrations" };
export default async function Integrations() {
  await requireOrg("admin.org");
  const list = integrations();
  return (<>
    <PageHeader title="Integrations" subtitle="Status comes from the server's configuration. Nothing is shown as connected unless its credentials are present." />
    <div className="grid gap-3 md:grid-cols-2">
      {list.map((i) => (
        <Card key={i.key} title={i.name} action={<Badge tone={BADGE[i.status][0]}>{BADGE[i.status][1]}</Badge>}>
          <p className="text-sm">{i.purpose}</p>
          <p className="mt-1 text-sm text-muted">{i.detail}</p>
          {i.status !== "active" && <p className="mt-2 text-xs text-muted">Needs: {i.needs.join(", ")}</p>}
        </Card>
      ))}
    </div>
  </>);
}
