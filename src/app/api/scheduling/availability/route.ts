import { json } from "@/lib/server/http";
import { getScheduler } from "@/services/scheduling";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const timezone = url.searchParams.get("timezone") || "UTC";
  const days = Math.min(Math.max(Number(url.searchParams.get("days") || 14), 1), 31);
  try { new Intl.DateTimeFormat("en", { timeZone: timezone }); } catch { return json({ ok: false, error: "Unknown timezone." }, 400); }

  const from = new Date();
  const to = new Date(from.getTime() + days * 86_400_000);
  try {
    const scheduler = getScheduler();
    const slots = await scheduler.getAvailability({ from, to, timezone });
    return json({ ok: true, provider: scheduler.id, slots });
  } catch (e) {
    console.error("[scheduling] availability failed", e);
    return json({ ok: false, error: "We couldn't load availability right now." }, 502);
  }
}
