/**
 * Custom scheduling API adapter — for NESJA's own scheduling service.
 * Contract:
 *   GET  {SCHEDULING_API_URL}/availability?from=ISO&to=ISO&timezone=TZ → { slots: Slot[] }
 *   POST {SCHEDULING_API_URL}/bookings  (BookingRequest)            → BookingResult
 * Requires: SCHEDULING_API_URL. Optional: SCHEDULING_API_KEY (Bearer).
 */
import { optionalEnv, requireEnv } from "@/lib/server/env";
import { SlotUnavailableError, type BookingResult, type SchedulingAdapter, type Slot } from "../types";

const call = (path: string, init?: RequestInit) => {
  const key = optionalEnv("SCHEDULING_API_KEY");
  return fetch(`${requireEnv("SCHEDULING_API_URL").replace(/\/$/, "")}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(key ? { Authorization: `Bearer ${key}` } : {}), ...init?.headers },
  });
};

export const customSchedulingAdapter: SchedulingAdapter = {
  id: "custom",
  label: "NESJA scheduling API",
  async getAvailability({ from, to, timezone }) {
    const res = await call(`/availability?${new URLSearchParams({ from: from.toISOString(), to: to.toISOString(), timezone })}`);
    if (!res.ok) throw new Error(`Scheduling API availability ${res.status}`);
    return ((await res.json()) as { slots: Slot[] }).slots;
  },
  async book(req) {
    const res = await call("/bookings", { method: "POST", body: JSON.stringify(req) });
    if (res.status === 409) throw new SlotUnavailableError();
    if (!res.ok) throw new Error(`Scheduling API booking ${res.status}`);
    return (await res.json()) as BookingResult;
  },
};
