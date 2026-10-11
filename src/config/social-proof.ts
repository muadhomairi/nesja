/**
 * Social-proof data model.
 *
 * RULE: nothing renders publicly unless it is verified AND (for people)
 * consented. Components read through the selectors at the bottom of this
 * file, never from the arrays directly. Ship empty until real, approved
 * content exists — never fabricate logos, quotes, ratings or metrics.
 */
export type ConsentStatus = "granted" | "pending" | "withdrawn";

export interface Testimonial {
  id: string;
  name: string;
  jobTitle: string;
  company: string;
  photo?: string;
  quote: string;
  industry?: string;
  country?: string;
  videoUrl?: string;
  consentStatus: ConsentStatus;
  verified: boolean;
  featured: boolean;
}

export interface CustomerLogo {
  id: string;
  company: string;
  logo: string;
  /** Written permission to display this logo has been received. */
  logoUsageApproved: boolean;
  verified: boolean;
}

export interface Metric {
  id: string;
  value: string;
  label: string;
  source: string;
  verified: boolean;
}

export interface CaseStudy {
  slug: string;
  company: string;
  logo?: string;
  industry: string;
  country: string;
  challenge: string;
  implementation: string;
  outcome: string;
  metric?: Metric;
  executiveQuote?: Pick<Testimonial, "name" | "jobTitle" | "quote">;
  videoUrl?: string;
  consentStatus: ConsentStatus;
  verified: boolean;
  publishedAt?: string;
}

export interface Recognition {
  id: string;
  kind: "analyst" | "review-platform" | "award" | "certification";
  name: string;
  detail: string;
  url?: string;
  rating?: number;
  reviewCount?: number;
  verified: boolean;
}

/* ---- Content (intentionally empty until verified, consented content exists) ---- */
export const testimonials: Testimonial[] = [];
export const customerLogos: CustomerLogo[] = [];
export const metrics: Metric[] = [];
export const caseStudies: CaseStudy[] = [];
export const recognitions: Recognition[] = [];

/* ---- Public selectors: the only way UI reads social proof ---- */
export const publicTestimonials = () => testimonials.filter((t) => t.verified && t.consentStatus === "granted");
export const publicLogos = () => customerLogos.filter((l) => l.verified && l.logoUsageApproved);
export const publicMetrics = () => metrics.filter((m) => m.verified);
export const publicCaseStudies = () => caseStudies.filter((c) => c.verified && c.consentStatus === "granted");
export const publicRecognitions = () => recognitions.filter((r) => r.verified);

/** Day-one fallback: industries NESJA is built for (no customer claims). */
export const builtForIndustries = ["Financial Services", "Telecommunications", "Healthcare", "Government", "Utilities", "Technology", "Professional Services"];
