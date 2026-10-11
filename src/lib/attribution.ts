/**
 * Marketing attribution: UTM parameters, referrer, landing page and
 * first/last touch. Attached to every lead so website demand can flow into
 * NESJA itself ("NESJA uses NESJA to sell NESJA").
 *
 * Storage: localStorage when analytics or marketing consent is granted
 * (persists across visits); otherwise sessionStorage (this visit only), so a
 * form the visitor chooses to submit can still be attributed.
 */
import { readConsent } from "./consent";

export interface Touch {
  source: string;
  medium: string;
  campaign?: string;
  content?: string;
  term?: string;
  referrer?: string;
  landingPage: string;
  timestamp: string;
}

export interface Attribution {
  firstTouch: Touch | null;
  lastTouch: Touch | null;
}

const KEY = "nesja_attribution_v1";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

const store = () => {
  if (typeof window === "undefined") return null;
  try {
    const c = readConsent();
    return c.analytics || c.marketing ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

export function getAttribution(): Attribution {
  const s = store();
  if (!s) return { firstTouch: null, lastTouch: null };
  try {
    return JSON.parse(s.getItem(KEY) || "null") ?? { firstTouch: null, lastTouch: null };
  } catch {
    return { firstTouch: null, lastTouch: null };
  }
}

function touchFromLocation(): Touch {
  const url = new URL(window.location.href);
  const p = url.searchParams;
  const ref = document.referrer ? new URL(document.referrer) : null;
  const externalRef = ref && ref.hostname !== url.hostname ? ref : null;
  const utmSource = p.get("utm_source");
  return {
    source: utmSource || (externalRef ? externalRef.hostname.replace(/^www\./, "") : "direct"),
    medium: p.get("utm_medium") || (utmSource ? "unknown" : externalRef ? "referral" : "none"),
    campaign: p.get("utm_campaign") || undefined,
    content: p.get("utm_content") || undefined,
    term: p.get("utm_term") || undefined,
    referrer: externalRef?.href,
    landingPage: url.pathname + url.search,
    timestamp: new Date().toISOString(),
  };
}

/** Call once per page load. Idempotent within a visit. */
export function captureAttribution(): Attribution {
  const s = store();
  if (!s) return { firstTouch: null, lastTouch: null };
  const current = getAttribution();
  const url = new URL(window.location.href);
  const hasCampaign = UTM_KEYS.some((k) => url.searchParams.has(k));
  const isExternal = !!document.referrer && new URL(document.referrer).hostname !== url.hostname;
  if (current.firstTouch && !hasCampaign && !isExternal) return current;

  const touch = touchFromLocation();
  const next: Attribution = { firstTouch: current.firstTouch ?? touch, lastTouch: touch };
  try { s.setItem(KEY, JSON.stringify(next)); } catch { /* storage full or blocked */ }
  return next;
}

/** When consent is granted later, promote session attribution to persistent storage. */
export function persistAttributionAfterConsent() {
  try {
    const session = window.sessionStorage.getItem(KEY);
    if (session && !window.localStorage.getItem(KEY)) window.localStorage.setItem(KEY, session);
  } catch { /* ignore */ }
}
