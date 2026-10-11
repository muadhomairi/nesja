/**
 * Generates candidate meeting slots inside host working hours, in the host's
 * timezone, returned as UTC ISO strings. Used by the mock and Google adapters.
 * Configure via SCHEDULING_HOST_TIMEZONE, SCHEDULING_HOURS (e.g. "9-17"),
 * SCHEDULING_WORKDAYS (e.g. "1,2,3,4,5" Mon–Fri; "0,1,2,3,4" Sun–Thu),
 * SCHEDULING_SLOT_MINUTES and SCHEDULING_MIN_NOTICE_HOURS.
 */
import type { Slot } from "./types";

export const schedulingSettings = () => {
  const [startHour, endHour] = (process.env.SCHEDULING_HOURS || "9-17").split("-").map(Number);
  return {
    hostTimezone: process.env.SCHEDULING_HOST_TIMEZONE || "UTC",
    startHour: startHour ?? 9,
    endHour: endHour ?? 17,
    workdays: (process.env.SCHEDULING_WORKDAYS || "1,2,3,4,5").split(",").map(Number),
    slotMinutes: Number(process.env.SCHEDULING_SLOT_MINUTES || 30),
    minNoticeHours: Number(process.env.SCHEDULING_MIN_NOTICE_HOURS || 4),
    meetingMethod: process.env.SCHEDULING_MEETING_METHOD || "Video call",
  };
};

/** Milliseconds that `timeZone` is ahead of UTC at instant `ts`. */
export function tzOffset(ts: number, timeZone: string) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(new Date(ts)).map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return asUtc - Math.floor(ts / 1000) * 1000;
}

/** Convert a wall-clock time in `timeZone` to a UTC timestamp (DST-safe). */
export function zonedToUtc(y: number, m: number, d: number, h: number, min: number, timeZone: string) {
  const guess = Date.UTC(y, m - 1, d, h, min);
  const first = guess - tzOffset(guess, timeZone);
  return guess - tzOffset(first, timeZone);
}

export function generateSlots(from: Date, to: Date, idPrefix: string): Slot[] {
  const s = schedulingSettings();
  const earliest = Date.now() + s.minNoticeHours * 3600_000;
  const slots: Slot[] = [];
  const dayMs = 86_400_000;
  for (let t = from.getTime(); t <= to.getTime(); t += dayMs) {
    const local = new Date(t + tzOffset(t, s.hostTimezone));
    const [y, m, d, dow] = [local.getUTCFullYear(), local.getUTCMonth() + 1, local.getUTCDate(), local.getUTCDay()];
    if (!s.workdays.includes(dow)) continue;
    for (let mins = s.startHour * 60; mins + s.slotMinutes <= s.endHour * 60; mins += s.slotMinutes) {
      const start = zonedToUtc(y, m, d, Math.floor(mins / 60), mins % 60, s.hostTimezone);
      if (start < earliest || start < from.getTime() || start > to.getTime() + dayMs) continue;
      const startIso = new Date(start).toISOString();
      slots.push({ id: `${idPrefix}:${startIso}`, start: startIso, end: new Date(start + s.slotMinutes * 60_000).toISOString() });
    }
  }
  return slots;
}
