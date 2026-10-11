/**
 * Subscription / checkout architecture for future self-serve plans.
 * No transactions are simulated. PAYMENT_PROVIDER:
 *   none (default) → checkout reports "unavailable"; the UI never shows purchase CTAs
 *   stripe         → creates a Stripe Checkout Session (STRIPE_SECRET_KEY + STRIPE_PRICE_<EDITION>_<TERM>)
 * Enable alongside NEXT_PUBLIC_FEATURE_SELF_SERVE=true.
 */
import { optionalEnv, requireEnv } from "@/lib/server/env";
import type { EditionId, TermId } from "@/config/pricing";

export interface CheckoutRequest { edition: EditionId; term: TermId; seats: number; email?: string; successUrl: string; cancelUrl: string }
export type CheckoutResult = { status: "redirect"; url: string } | { status: "unavailable"; message: string };

export async function createCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
  const provider = optionalEnv("PAYMENT_PROVIDER", "none");
  if (provider !== "stripe") return { status: "unavailable", message: "Online purchase isn't available yet. Book a demo or talk to sales for a proposal." };

  const priceId = requireEnv(`STRIPE_PRICE_${req.edition.toUpperCase()}_${req.term.toUpperCase()}`);
  const body = new URLSearchParams({
    mode: "subscription", "line_items[0][price]": priceId, "line_items[0][quantity]": String(req.seats),
    success_url: req.successUrl, cancel_url: req.cancelUrl, ...(req.email ? { customer_email: req.email } : {}),
  });
  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST", headers: { Authorization: `Bearer ${requireEnv("STRIPE_SECRET_KEY")}`, "Content-Type": "application/x-www-form-urlencoded" }, body,
  });
  if (!res.ok) throw new Error(`Stripe ${res.status}`);
  return { status: "redirect", url: ((await res.json()) as { url: string }).url };
}
