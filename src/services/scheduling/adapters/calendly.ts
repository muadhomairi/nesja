/**
 * Calendly adapter (Calendly API v2 + Scheduling API).
 * Requires: CALENDLY_API_TOKEN, CALENDLY_EVENT_TYPE_URI.
 * Calendly returns availability in windows of up to 7 days; we page through.
 * Verify endpoint/field names against Calendly's current API reference.
 */
import { requireEnv } from "@/lib/server/env";
import { schedulingSettings } from "../slots";
import type { SchedulingAdapter, Slot } from "../types";

const api = (path: string, init?: RequestInit) =>
  fetch(`https://api.calendly.com${path}`, { ...init, headers: { Authorization: `Bearer ${requireEnv("CALENDLY_API_TOKEN")}`, "Content-Type": "application/json", ...init?.headers } });

export const calendlyAdapter: SchedulingAdapter = {
  id: "calendly",
  label: "Calendly",
  async getAvailability({ from, to }) {
    const eventType = requireEnv("CALENDLY_EVENT_TYPE_URI");
    const slots: Slot[] = [];
    const minutes = schedulingSettings().slotMinutes;
    for (let start = Math.max(from.getTime(), Date.now() + 60_000); start < to.getTime(); start += 7 * 86_400_000) {
      const end = Math.min(start + 7 * 86_400_000 - 60_000, to.getTime());
      const q = new URLSearchParams({ event_type: eventType, start_time: new Date(start).toISOString(), end_time: new Date(end).toISOString() });
      const res = await api(`/event_type_available_times?${q}`);
      if (!res.ok) throw new Error(`Calendly availability ${res.status}`);
      const data = (await res.json()) as { collection: { start_time: string; status: string }[] };
      data.collection.filter((c) => c.status === "available").forEach((c) => {
        const s = new Date(c.start_time);
        slots.push({ id: `calendly:${s.toISOString()}`, start: s.toISOString(), end: new Date(s.getTime() + minutes * 60_000).toISOString() });
      });
    }
    return slots;
  },
  async book(req) {
    const res = await api("/invitees", {
      method: "POST",
      body: JSON.stringify({
        event_type: requireEnv("CALENDLY_EVENT_TYPE_URI"),
        start_time: req.start,
        invitee: { name: req.attendee.name, email: req.attendee.email, timezone: req.timezone },
        questions_and_answers: [{ question: "Notes", answer: req.notes, position: 0 }],
      }),
    });
    if (!res.ok) throw new Error(`Calendly booking ${res.status}`);
    const data = (await res.json()) as { resource?: { uri?: string; event?: string } };
    return { id: data.resource?.uri ?? "calendly", start: req.start, end: req.end, timezone: req.timezone, meetingMethod: schedulingSettings().meetingMethod, calendarStatus: "invite_sent", provider: "calendly" };
  },
};
