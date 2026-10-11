/**
 * Microsoft Bookings adapter via Microsoft Graph.
 * Requires: MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET (app permission
 * BookingsAppointment.ReadWrite.All), MS_BOOKINGS_BUSINESS_ID,
 * MS_BOOKINGS_SERVICE_ID, MS_BOOKINGS_STAFF_IDS (comma-separated).
 */
import { requireEnv } from "@/lib/server/env";
import { graph } from "../../microsoft-graph";
import { generateSlots } from "../slots";
import type { SchedulingAdapter } from "../types";

const biz = () => encodeURIComponent(requireEnv("MS_BOOKINGS_BUSINESS_ID"));
const graphTime = (iso: string) => ({ dateTime: iso.replace("Z", ""), timeZone: "UTC" });

export const microsoftBookingsAdapter: SchedulingAdapter = {
  id: "microsoft-bookings",
  label: "Microsoft Bookings",
  async getAvailability({ from, to }) {
    const res = await graph(`/solutions/bookingBusinesses/${biz()}/getStaffAvailability`, {
      method: "POST",
      body: JSON.stringify({ staffIds: requireEnv("MS_BOOKINGS_STAFF_IDS").split(","), startDateTime: graphTime(from.toISOString()), endDateTime: graphTime(to.toISOString()) }),
    });
    if (!res.ok) throw new Error(`Bookings availability ${res.status}`);
    const data = (await res.json()) as { value: { availabilityItems: { status: string; startDateTime: { dateTime: string }; endDateTime: { dateTime: string } }[] }[] };
    const windows = data.value.flatMap((s) => s.availabilityItems).filter((i) => i.status === "available")
      .map((i) => [Date.parse(i.startDateTime.dateTime + "Z"), Date.parse(i.endDateTime.dateTime + "Z")] as const);
    return generateSlots(from, to, "msb").filter((slot) => {
      const [s, e] = [Date.parse(slot.start), Date.parse(slot.end)];
      return windows.some(([ws, we]) => s >= ws && e <= we);
    });
  },
  async book(req) {
    const res = await graph(`/solutions/bookingBusinesses/${biz()}/appointments`, {
      method: "POST",
      body: JSON.stringify({
        serviceId: requireEnv("MS_BOOKINGS_SERVICE_ID"),
        startDateTime: graphTime(req.start),
        endDateTime: graphTime(req.end),
        isLocationOnline: true,
        customerTimeZone: req.timezone,
        serviceNotes: req.notes,
        customers: [{ "@odata.type": "#microsoft.graph.bookingCustomerInformation", name: req.attendee.name, emailAddress: req.attendee.email, timeZone: req.timezone }],
      }),
    });
    if (!res.ok) throw new Error(`Bookings appointment ${res.status}`);
    const data = (await res.json()) as { id: string; joinWebUrl?: string };
    return { id: data.id, start: req.start, end: req.end, timezone: req.timezone, meetingMethod: "Microsoft Teams", joinUrl: data.joinWebUrl, calendarStatus: "invite_sent", provider: "microsoft-bookings" };
  },
};
