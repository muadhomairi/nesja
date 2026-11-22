import { redirect } from "next/navigation";
import { requireSession } from "@/lib/server/session";
import { env } from "@/lib/env";
import { ButtonLink, Empty } from "@/components/ui/primitives";
/** Engage entry point: hands over to the deployed Engage app when one exists; never pretends it is migrated. */
export default async function Engage() {
  await requireSession();
  const url = env.engageUrl();
  if (url) redirect(url);
  return (
    <div className="mx-auto max-w-lg py-24">
      <Empty title="NESJA Engage is not deployed yet">Engage V1.1.6 exists as a release candidate but has no live environment. When it is deployed, this entry point will open it with your NESJA identity.
        <div className="mt-4"><ButtonLink href="/launcher" variant="secondary">Back to products</ButtonLink></div></Empty>
    </div>
  );
}
