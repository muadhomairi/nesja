/**
 * DEVELOPMENT ADAPTER — replace by setting SCHEDULING_PROVIDER to
 * calendly | microsoft-bookings | hubspot | google | custom.
 * Generates real availability from configured working hours and holds
 * bookings in memory (prevents double-booking within one server process).
 */
import { randomUUID } from "node:crypto";
import { generateSlots, schedulingSettings } from "../slots";
import { SlotUnavailableError, type SchedulingAdapter } from "../types";

const booked = new Set<string>();

export const mockSchedulingAdapter: SchedulingAdapter = {
  id: "mock",
  label: "Development scheduler",
  async getAvailability({ from, to }) {
    return generateSlots(from, to, "mock").filter((s) => !booked.has(s.start));
  },
  async book(req) {
    if (booked.has(req.start) || new Date(req.start).getTime() < Date.now()) throw new SlotUnavailableError();
    booked.add(req.start);
    return {
      id: `bk_${randomUUID()}`,
      start: req.start,
      end: req.end,
      timezone: req.timezone,
      meetingMethod: schedulingSettings().meetingMethod,
      calendarStatus: "pending",
      provider: "mock",
    };
  },
};
