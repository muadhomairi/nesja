/** Fire-and-log helpers: a failed email must never fail a booking or enquiry. */
import { getEmailService } from "./email/adapters";
import { internalLeadNotification } from "./email/templates";
import type { EmailMessage } from "./email/types";

export async function safeSend(msg: EmailMessage) {
  try { await getEmailService().send(msg); return true; } catch (e) { console.error("[email] send failed", e); return false; }
}

export async function notifyTeam(type: string, summary: Record<string, unknown>) {
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!to) return;
  await safeSend({ to, ...internalLeadNotification({ type, summary }) });
}
