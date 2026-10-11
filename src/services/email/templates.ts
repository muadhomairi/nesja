/** Transactional email templates (plain, accessible HTML + text). */
import { siteConfig } from "@/config/site";

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const shell = (title: string, body: string) => `<!doctype html><html><body style="margin:0;background:#F5F7FB;font-family:Arial,Helvetica,sans-serif;color:#0C1324">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px">
<tr><td style="background:#0C1324;padding:20px 28px;border-radius:12px 12px 0 0;color:#F5F7FB;font-weight:700;letter-spacing:.04em">NESJA<span style="color:#12C6C2">.OS</span></td></tr>
<tr><td style="padding:28px"><h1 style="font-size:20px;margin:0 0 16px">${esc(title)}</h1>${body}</td></tr>
<tr><td style="padding:16px 28px;color:#5B6678;font-size:12px">${esc(siteConfig.name)} · ${esc(siteConfig.category)}</td></tr>
</table></td></tr></table></body></html>`;

export function demoConfirmation(p: { name: string; when: string; timezone: string; method: string; joinUrl?: string; requested?: boolean }) {
  if (p.requested) {
    const req = [`Hi ${p.name.split(" ")[0]},`, `Thank you for requesting a NESJA.OS demonstration. Your preferred time is ${p.when} (${p.timezone}).`, "A member of the NESJA team will review your request and confirm the meeting with a calendar invitation.", "— The NESJA team"];
    return { subject: "Your NESJA.OS demo request", text: req.join("\n\n"), html: shell("Your demo request has been received.", req.map((l) => `<p style="margin:0 0 12px;line-height:1.6">${esc(l)}</p>`).join("")) };
  }
  const lines = [`Hi ${p.name.split(" ")[0]},`, `You're booked for a NESJA.OS demo on ${p.when} (${p.timezone}).`, `Meeting method: ${p.method}.`, p.joinUrl ? `Join link: ${p.joinUrl}` : "Your meeting link will follow in the calendar invitation.", "A calendar file is attached so you can add it to your calendar.", "— The NESJA team"];
  return {
    subject: "You're booked: NESJA.OS demo",
    text: lines.join("\n\n"),
    html: shell("You're booked.", lines.map((l) => `<p style="margin:0 0 12px;line-height:1.6">${esc(l)}</p>`).join("")),
  };
}

export function contactAcknowledgement(p: { name: string }) {
  const lines = [`Hi ${p.name.split(" ")[0]},`, "Thank you. Your enquiry has been received. A member of the NESJA team will review your enquiry and respond using the contact details you provided.", "— The NESJA team"];
  return { subject: "Your enquiry has been received", text: lines.join("\n\n"), html: shell("Thank you. Your enquiry has been received.", lines.map((l) => `<p style="margin:0 0 12px;line-height:1.6">${esc(l)}</p>`).join("")) };
}

export function internalLeadNotification(p: { type: string; summary: Record<string, unknown> }) {
  const rows = Object.entries(p.summary).filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`);
  return { subject: `New website enquiry: ${p.type}`, text: rows.join("\n"), html: shell(`New ${p.type}`, `<pre style="font-size:13px;white-space:pre-wrap">${esc(rows.join("\n"))}</pre>`) };
}
