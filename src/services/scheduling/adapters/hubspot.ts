/**
 * HubSpot Meetings adapter (Scheduler API v3).
 * Requires: HUBSPOT_PRIVATE_APP_TOKEN (scope: scheduler.meetings.meeting-link.read),
 * HUBSPOT_MEETING_SLUG. Verify against HubSpot's current Scheduler API docs.
 */
import { requireEnv } from "@/lib/server/env";
import { schedulingSettings } from "../slots";
import type { SchedulingAdapter, Slot } from "../types";

const hs = (path: string, init?: RequestInit) =>
  fetch(`https://api.hubapi.com/scheduler/v3/meetings/meeting-links/book${path}`, { ...init, headers: { Authorization: `Bearer ${requireEnv("HUBSPOT_PRIVATE_APP_TOKEN")}`, "Content-Type": "application/json", ...init?.headers } });

export const hubspotMeetingsAdapter: SchedulingAdapter = {
  id: "hubspot",
  label: "HubSpot Meetings",
  async getAvailability({ from, to, timezone }) {
    const minutes = schedulingSettings().slotMinutes;
    const res = await hs(`/availability-page/${encodeURIComponent(requireEnv("HUBSPOT_MEETING_SLUG"))}?timezone=${encodeURIComponent(timezone)}`);
    if (!res.ok) throw new Error(`HubSpot availability ${res.status}`);
    const data = (await res.json()) as { linkAvailability?: { linkAvailabilityByDuration?: Record<string, { availabilities: { startMillisUtc: number; endMillisUtc: number }[] }> } };
    const byDuration = data.linkAvailability?.linkAvailabilityByDuration ?? {};
    const list = byDuration[String(minutes * 60_000)]?.availabilities ?? Object.values(byDuration)[0]?.availabilities ?? [];
    return list
      .filter((a) => a.startMillisUtc >= from.getTime() && a.startMillisUtc <= to.getTime())
      .map<Slot>((a) => ({ id: `hubspot:${new Date(a.startMillisUtc).toISOString()}`, start: new Date(a.startMillisUtc).toISOString(), end: new Date(a.endMillisUtc).toISOString() }));
  },
  async book(req) {
    const [firstName, ...rest] = req.attendee.name.split(" ");
    const res = await hs("", {
      method: "POST",
      body: JSON.stringify({
        slug: requireEnv("HUBSPOT_MEETING_SLUG"), duration: Date.parse(req.end) - Date.parse(req.start), startTime: Date.parse(req.start),
        email: req.attendee.email, firstName, lastName: rest.join(" ") || "-", timezone: req.timezone, locale: "en-us",
      }),
    });
    if (!res.ok) throw new Error(`HubSpot booking ${res.status}`);
    const data = (await res.json()) as { calendarEventId?: string; meetingLink?: string };
    return { id: data.calendarEventId ?? "hubspot", start: req.start, end: req.end, timezone: req.timezone, meetingMethod: schedulingSettings().meetingMethod, joinUrl: data.meetingLink, calendarStatus: "invite_sent", provider: "hubspot" };
  },
};
