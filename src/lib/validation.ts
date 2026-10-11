/**
 * Shared validation schemas — used by client forms for instant feedback and
 * by API routes as the authoritative check.
 */
import { z } from "zod";
import { enquiryCategories } from "@/config/enquiries";

export const FREE_EMAIL_DOMAINS = ["gmail.com", "googlemail.com", "yahoo.com", "hotmail.com", "outlook.com", "live.com", "icloud.com", "me.com", "aol.com", "proton.me", "protonmail.com", "gmx.com", "mail.com", "yandex.com"];
export const isFreeEmail = (email: string) => FREE_EMAIL_DOMAINS.includes(email.split("@")[1]?.toLowerCase() ?? "");

export const teamSizes = ["1–10", "11–50", "51–200", "201–500", "501–1,000", "1,000+"] as const;
export const demoInterests = ["Pipeline", "Quoting", "Contracts", "Customer Success", "Communication", "Commercial Intelligence", "AI", "Everything"] as const;
export const companySizes = ["1–50", "51–200", "201–1,000", "1,001–5,000", "5,000+"] as const;

export const emailField = z.string().trim().min(1, "Enter your work email.").max(254).email("Enter a valid email address, like name@company.com.");
const name = z.string().trim().min(2, "Enter your full name.").max(120);
const company = z.string().trim().min(2, "Enter your company name.").max(160);

const touch = z.object({
  source: z.string().max(200), medium: z.string().max(200), campaign: z.string().max(200).optional(), content: z.string().max(200).optional(),
  term: z.string().max(200).optional(), referrer: z.string().max(2000).optional(), landingPage: z.string().max(2000), timestamp: z.string().max(40),
}).nullable();
export const attributionSchema = z.object({ firstTouch: touch, lastTouch: touch }).optional();

/** Where on the site the visitor submitted the form, and what led to it. */
export const submissionContextSchema = z.object({
  sourcePage: z.string().max(2000),
  formContext: z.string().max(300),
  clientTimestamp: z.string().max(40).optional(),
}).optional();

/** Honeypot: real users never fill this hidden field. */
const honeypot = z.string().max(0).optional();

export const demoContactSchema = z.object({ email: emailField, name, company });
export const demoProfileSchema = z.object({ teamSize: z.enum(teamSizes, { errorMap: () => ({ message: "Choose your team size." }) }), interest: z.enum(demoInterests, { errorMap: () => ({ message: "Choose what you'd like to see." }) }) });

export const bookingSchema = demoContactSchema.merge(demoProfileSchema).extend({
  slotId: z.string().min(1, "Choose a time."),
  start: z.string().datetime(),
  end: z.string().datetime(),
  timezone: z.string().min(1).max(64),
  /** Optional context carried from the page the visitor came from (e.g. pricing selection). */
  context: z.string().max(300).optional(),
  attribution: attributionSchema,
  submission: submissionContextSchema,
  website: honeypot,
});
export type BookingInput = z.infer<typeof bookingSchema>;

export const contactSchema = z.object({
  enquiryType: z.enum(enquiryCategories, { errorMap: () => ({ message: "Choose an enquiry type." }) }).refine((v) => v !== "DEMO", "Choose an enquiry type."),
  name,
  email: emailField,
  company,
  role: z.string().trim().min(2, "Enter your role.").max(120),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters).").max(4000),
  enterprise: z.boolean().default(false),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  companySize: z.enum(companySizes).optional().or(z.literal("")),
  // "" must be matched before coercion, otherwise an empty field is recorded as 0 users.
  estimatedUsers: z.union([z.literal(""), z.coerce.number().int().min(1, "Enter a number of users.").max(1_000_000)]).optional(),
  attribution: attributionSchema,
  submission: submissionContextSchema,
  website: honeypot,
});
export type ContactInput = z.infer<typeof contactSchema>;

export const subscribeSchema = z.object({ email: emailField, location: z.string().max(60).default("resources"), attribution: attributionSchema, submission: submissionContextSchema, website: honeypot });

export const signInSchema = z.object({ email: emailField });

/** Flatten zod errors into { field: message } for forms. */
export function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
