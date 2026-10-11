/**
 * Scheduling service. Select with SCHEDULING_PROVIDER:
 *   mock (default) | calendly | microsoft-bookings | hubspot | google | custom
 * ▶ REPLACE "mock" with your production scheduler.
 */
import type { SchedulingAdapter } from "./types";
import { mockSchedulingAdapter } from "./adapters/mock";
import { calendlyAdapter } from "./adapters/calendly";
import { microsoftBookingsAdapter } from "./adapters/microsoft-bookings";
import { hubspotMeetingsAdapter } from "./adapters/hubspot";
import { googleCalendarAdapter } from "./adapters/google";
import { customSchedulingAdapter } from "./adapters/custom";

const adapters: Record<string, SchedulingAdapter> = {
  mock: mockSchedulingAdapter,
  calendly: calendlyAdapter,
  "microsoft-bookings": microsoftBookingsAdapter,
  hubspot: hubspotMeetingsAdapter,
  google: googleCalendarAdapter,
  custom: customSchedulingAdapter,
};

export function getScheduler(): SchedulingAdapter {
  const id = process.env.SCHEDULING_PROVIDER || "mock";
  const adapter = adapters[id];
  if (!adapter) throw new Error(`Unknown SCHEDULING_PROVIDER "${id}"`);
  return adapter;
}

export * from "./types";
