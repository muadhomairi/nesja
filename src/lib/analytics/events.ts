/**
 * Typed funnel-event catalogue. Add events here first; the compiler then
 * enforces correct names and properties at every call site.
 */
export interface AnalyticsEventMap {
  hero_demo_clicked: { location: string };
  platform_explored: { location: string };
  pricing_viewed: Record<string, never>;
  pricing_duration_changed: { term: string; edition: string };
  seat_count_changed: { seats: number; edition: string };
  pricing_edition_changed: { edition: string };
  pricing_currency_changed: { currency: string };
  pricing_cta_clicked: { edition: string; term: string; seats: number; cta: string };
  demo_started: { source?: string };
  demo_step_completed: { step: number; name: string };
  demo_completed: { teamSize: string; interest: string; provider: string };
  contact_sales_clicked: { location: string };
  contact_submitted: { enterprise: boolean };
  module_viewed: { module: string };
  journey_step_viewed: { step: string };
  case_study_viewed: { slug: string };
  resource_downloaded: { slug: string; format: string };
  newsletter_subscribed: { location: string };
  signup_started: { location: string };
  signup_completed: { plan?: string };
  sign_in_started: { method: string };
  cta_clicked: { label: string; href: string; location: string };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
