import { bookingSchema } from "@/lib/validation";
import { json, leadSource, parseBody, requestMeta } from "@/lib/server/http";
import { getScheduler, SlotUnavailableError } from "@/services/scheduling";
import { getLeadService } from "@/services/leads";
import { demoConfirmation } from "@/services/email/templates";
import { notifyTeam, safeSend } from "@/services/notify";
import { buildIcs } from "@/lib/ics";

export async function POST(req: Request) {
  const parsed = await parseBody(req, bookingSchema);
  if ("response" in parsed) return parsed.response;
  const d = parsed.data;
  if (d.website) return json({ ok: false, error: "Unable to book." }, 400);

  const scheduler = getScheduler();
  let booking;
  try {
    booking = await scheduler.book({
      slotId: d.slotId, start: d.start, end: d.end, timezone: d.timezone,
      attendee: { name: d.name, email: d.email, company: d.company },
      notes: `Team size: ${d.teamSize}. Primary interest: ${d.interest}.${d.context ? ` Context: ${d.context}.` : ""}`,
    });
  } catch (e) {
    if (e instanceof SlotUnavailableError) return json({ ok: false, code: "slot_unavailable", error: e.message }, 409);
    console.error("[scheduling] booking failed", e);
    return json({ ok: false, error: "We couldn't confirm that booking. Please try again." }, 502);
  }

  // Without a connected calendar the chosen slot is a requested time that the
  // NESJA team confirms personally; nothing tells the visitor it is booked.
  const requested = booking.provider === "mock";

  // Lead capture never blocks a confirmed booking.
  let leadId: string | undefined;
  try {
    leadId = (await getLeadService().submit({
      type: "demo_request",
      category: "DEMO",
      contact: { name: d.name, email: d.email, company: d.company },
      details: { teamSize: d.teamSize, interest: d.interest, context: d.context, bookingId: booking.id, meetingStart: booking.start, timezone: d.timezone, scheduler: booking.provider, bookingStatus: requested ? "requested" : "booked" },
      attribution: d.attribution,
      source: leadSource(req, d.submission),
      meta: requestMeta(req),
    })).id;
  } catch (e) { console.error("[leads] demo lead failed (booking kept)", e); }

  const when = new Intl.DateTimeFormat("en-GB", { dateStyle: "full", timeStyle: "short", timeZone: d.timezone }).format(new Date(booking.start));
  const ics = buildIcs({ uid: booking.id, start: booking.start, end: booking.end, title: "NESJA.OS demo", description: `Your NESJA.OS demo. ${booking.joinUrl ? `Join: ${booking.joinUrl}` : "Meeting link to follow."}`, location: booking.meetingMethod, url: booking.joinUrl });
  const emailSent = await safeSend({ to: d.email, ...demoConfirmation({ name: d.name, when, timezone: d.timezone, method: booking.meetingMethod, joinUrl: booking.joinUrl, requested }), ics: requested ? undefined : ics });
  await notifyTeam(requested ? "DEMO request (confirm time with the visitor)" : "DEMO booked", {
    name: d.name, email: d.email, company: d.company, teamSize: d.teamSize, interest: d.interest, when, timezone: d.timezone, context: d.context,
    sourcePage: d.submission?.sourcePage, utmSource: d.attribution?.lastTouch?.source, utmMedium: d.attribution?.lastTouch?.medium, utmCampaign: d.attribution?.lastTouch?.campaign, referrer: d.attribution?.lastTouch?.referrer,
  });

  return json({ ok: true, booking, requested, leadId, emailSent, emailProvider: process.env.EMAIL_PROVIDER || "console" });
}
