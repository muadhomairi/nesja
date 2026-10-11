/** RFC 5545 calendar file generator (used by the email invite and the "Add to calendar" download). */
const stamp = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const escapeText = (s: string) => s.replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

export function buildIcs(e: { uid: string; start: string; end: string; title: string; description: string; location?: string; url?: string }) {
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//NESJA.OS//Website//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.uid}@nesja.os`, `DTSTAMP:${stamp(new Date().toISOString())}`, `DTSTART:${stamp(e.start)}`, `DTEND:${stamp(e.end)}`,
    `SUMMARY:${escapeText(e.title)}`, `DESCRIPTION:${escapeText(e.description)}`,
    e.location ? `LOCATION:${escapeText(e.location)}` : "", e.url ? `URL:${e.url}` : "",
    "END:VEVENT", "END:VCALENDAR",
  ].filter(Boolean).join("\r\n");
}
