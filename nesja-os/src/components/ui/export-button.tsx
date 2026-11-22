import { getSession } from "@/lib/server/session";
import { ButtonLink } from "./primitives";

/** Shown only to users with data.export; the route checks the permission again. */
export async function ExportButton({ entity }: { entity: string }) {
  const s = await getSession();
  if (!s?.org || !s.can("data.export")) return null;
  return <ButtonLink variant="secondary" href={`/api/export/${entity}`}>Export CSV</ButtonLink>;
}
