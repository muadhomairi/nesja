"use client";
/**
 * Wires consent → analytics providers, captures attribution, and sends
 * page views on client-side navigation. Renders nothing.
 */
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { CONSENT_EVENT, readConsent, type ConsentState } from "@/lib/consent";
import { setAnalyticsConsent, trackPage } from "@/lib/analytics";
import { captureAttribution, persistAttributionAfterConsent } from "@/lib/attribution";

export function AnalyticsRoot() {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    setAnalyticsConsent(readConsent());
    const onChange = (e: Event) => {
      const state = (e as CustomEvent<ConsentState>).detail;
      if (state.analytics || state.marketing) persistAttributionAfterConsent();
      setAnalyticsConsent(state);
    };
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  useEffect(() => {
    captureAttribution();
    trackPage(pathname + (search.toString() ? `?${search}` : ""));
  }, [pathname, search]);

  return null;
}
