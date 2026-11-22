import { z } from "zod";
export const email = z.string().trim().toLowerCase().email("Enter a valid work e-mail").max(254);
export const password = z.string().min(12, "Use at least 12 characters").max(128)
  .regex(/[a-z]/, "Add a lowercase letter").regex(/[A-Z]/, "Add an uppercase letter").regex(/[0-9]/, "Add a number");
export type FormState = { ok: boolean; message?: string } | null;
/** Only same-site relative paths may be used as post-login destinations (prevents open redirects). */
export const safeNext = (v: unknown) => (typeof v === "string" && /^\/(?!\/)[\w\-/?=&.%]*$/.test(v) ? v : "/launcher");
