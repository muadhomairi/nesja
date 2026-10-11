/**
 * Transactional email adapters. Select with EMAIL_PROVIDER:
 *   console (default, development) | resend | sendgrid | microsoft-graph
 * All providers send from EMAIL_FROM (e.g. "NESJA <hello@nesja.ai>").
 */
import { requireEnv, optionalEnv } from "@/lib/server/env";
import { graph } from "../microsoft-graph";
import type { EmailAdapter } from "./types";

const b64 = (s: string) => Buffer.from(s).toString("base64");

/** DEVELOPMENT ADAPTER — logs instead of sending. Replace via EMAIL_PROVIDER. */
export const consoleEmail: EmailAdapter = {
  id: "console",
  async send(msg) {
    console.info(`[email:console] to=${msg.to} subject="${msg.subject}"\n${msg.text}`);
    return { id: `console_${Date.now()}` };
  },
};

export const resendEmail: EmailAdapter = {
  id: "resend",
  async send(msg) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${requireEnv("RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: requireEnv("EMAIL_FROM"), to: [msg.to], subject: msg.subject, html: msg.html, text: msg.text, reply_to: msg.replyTo,
        attachments: msg.ics ? [{ filename: "invite.ics", content: b64(msg.ics) }] : undefined,
      }),
    });
    if (!res.ok) throw new Error(`Resend ${res.status}`);
    return { id: ((await res.json()) as { id: string }).id };
  },
};

export const sendgridEmail: EmailAdapter = {
  id: "sendgrid",
  async send(msg) {
    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${requireEnv("SENDGRID_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: msg.to }] }],
        from: { email: requireEnv("EMAIL_FROM").replace(/.*<(.+)>.*/, "$1") },
        reply_to: msg.replyTo ? { email: msg.replyTo } : undefined,
        subject: msg.subject,
        content: [{ type: "text/plain", value: msg.text }, { type: "text/html", value: msg.html }],
        attachments: msg.ics ? [{ content: b64(msg.ics), filename: "invite.ics", type: "text/calendar" }] : undefined,
      }),
    });
    if (!res.ok) throw new Error(`SendGrid ${res.status}`);
    return { id: res.headers.get("x-message-id") ?? "sendgrid" };
  },
};

/** Requires MS_* credentials (Mail.Send application permission) and EMAIL_GRAPH_SENDER (mailbox UPN). */
export const graphEmail: EmailAdapter = {
  id: "microsoft-graph",
  async send(msg) {
    const sender = requireEnv("EMAIL_GRAPH_SENDER");
    const res = await graph(`/users/${encodeURIComponent(sender)}/sendMail`, {
      method: "POST",
      body: JSON.stringify({
        message: {
          subject: msg.subject,
          body: { contentType: "HTML", content: msg.html },
          toRecipients: [{ emailAddress: { address: msg.to } }],
          replyTo: msg.replyTo ? [{ emailAddress: { address: msg.replyTo } }] : undefined,
          attachments: msg.ics ? [{ "@odata.type": "#microsoft.graph.fileAttachment", name: "invite.ics", contentType: "text/calendar", contentBytes: b64(msg.ics) }] : undefined,
        },
        saveToSentItems: true,
      }),
    });
    if (!res.ok) throw new Error(`Graph sendMail ${res.status}`);
    return { id: "graph" };
  },
};

const adapters: Record<string, EmailAdapter> = { console: consoleEmail, resend: resendEmail, sendgrid: sendgridEmail, "microsoft-graph": graphEmail };

export function getEmailService(): EmailAdapter {
  const id = optionalEnv("EMAIL_PROVIDER", "console");
  const a = adapters[id];
  if (!a) throw new Error(`Unknown EMAIL_PROVIDER "${id}"`);
  return a;
}
