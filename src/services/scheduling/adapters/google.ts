/**
 * Google Calendar adapter (free/busy + event insert with Google Meet).
 * Requires: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
 * (offline token for the host account, scope calendar.events + calendar.freebusy),
 * GOOGLE_CALENDAR_ID (default "primary").
 */
import { randomUUID } from "node:crypto";
import { optionalEnv, requireEnv } from "@/lib/server/env";
import { generateSlots } from "../slots";
import { SlotUnavailableError, type SchedulingAdapter } from "../types";

async function token() {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: requireEnv("GOOGLE_CLIENT_ID"), client_secret: requireEnv("GOOGLE_CLIENT_SECRET"), refresh_token: requireEnv("GOOGLE_REFRESH_TOKEN"), grant_type: "refresh_token" }),
  });
  if (!res.ok) throw new Error(`Google token ${res.status}`);
  return ((await res.json()) as { access_token: string }).access_token;
}

const calendarId = () => optionalEnv("GOOGLE_CALENDAR_ID", "primary");

async function busy(from: Date, to: Date) {
  const res = await fetch("https://www.googleapis.com/calendar/v3/freeBusy", {
    method: "POST",
    headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ timeMin: from.toISOString(), timeMax: to.toISOString(), items: [{ id: calendarId() }] }),
  });
  if (!res.ok) throw new Error(`Google free/busy ${res.status}`);
  const data = (await res.json()) as { calendars: Record<string, { busy: { start: string; end: string }[] }> };
  return (data.calendars[calendarId()]?.busy ?? []).map((b) => [Date.parse(b.start), Date.parse(b.end)] as const);
}

const overlaps = (s: number, e: number, windows: readonly (readonly [number, number])[]) => windows.some(([bs, be]) => s < be && e > bs);

export const googleCalendarAdapter: SchedulingAdapter = {
  id: "google",
  label: "Google Calendar",
  async getAvailability({ from, to }) {
    const blocked = await busy(from, to);
    return generateSlots(from, to, "google").filter((s) => !overlaps(Date.parse(s.start), Date.parse(s.end), blocked));
  },
  async book(req) {
    const blocked = await busy(new Date(req.start), new Date(req.end));
    if (overlaps(Date.parse(req.start), Date.parse(req.end), blocked)) throw new SlotUnavailableError();
    const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId())}/events?conferenceDataVersion=1&sendUpdates=all`, {
      method: "POST",
      headers: { Authorization: `Bearer ${await token()}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        summary: `NESJA.OS demo — ${req.attendee.company}`,
        description: req.notes,
        start: { dateTime: req.start }, end: { dateTime: req.end },
        attendees: [{ email: req.attendee.email, displayName: req.attendee.name }],
        conferenceData: { createRequest: { requestId: randomUUID(), conferenceSolutionKey: { type: "hangoutsMeet" } } },
      }),
    });
    if (!res.ok) throw new Error(`Google event ${res.status}`);
    const data = (await res.json()) as { id: string; hangoutLink?: string };
    return { id: data.id, start: req.start, end: req.end, timezone: req.timezone, meetingMethod: "Google Meet", joinUrl: data.hangoutLink, calendarStatus: "invite_sent", provider: "google" };
  },
};
