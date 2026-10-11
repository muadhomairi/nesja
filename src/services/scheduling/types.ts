export interface Slot { id: string; start: string; end: string }

export interface AvailabilityRequest { from: Date; to: Date; timezone: string }

export interface BookingRequest {
  slotId: string;
  start: string;
  end: string;
  timezone: string;
  attendee: { name: string; email: string; company: string };
  notes: string;
}

export type CalendarStatus = "invite_sent" | "pending" | "not_sent";

export interface BookingResult {
  id: string;
  start: string;
  end: string;
  timezone: string;
  meetingMethod: string;
  joinUrl?: string;
  calendarStatus: CalendarStatus;
  provider: string;
}

export interface SchedulingAdapter {
  id: string;
  label: string;
  getAvailability(req: AvailabilityRequest): Promise<Slot[]>;
  book(req: BookingRequest): Promise<BookingResult>;
}

export class SlotUnavailableError extends Error {
  constructor() { super("That time was just taken. Please choose another."); this.name = "SlotUnavailableError"; }
}
