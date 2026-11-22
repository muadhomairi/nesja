import { redirect } from "next/navigation";
import { getSession } from "@/lib/server/session";
import { isConfigured } from "@/lib/env";
export default async function Home() {
  if (!isConfigured()) redirect("/setup-required");
  redirect((await getSession()) ? "/launcher" : "/login");
}
