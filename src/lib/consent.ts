/**
 * Cookie / consent state. Stored in a first-party cookie so both the client
 * and (later) the server can read it. Non-essential scripts and storage only
 * run when the matching category is granted.
 */
export type ConsentCategory = "necessary" | "analytics" | "marketing";
export interface ConsentState {
  version: number;
  decided: boolean;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

export const CONSENT_COOKIE = "nesja_consent";
export const CONSENT_VERSION = 1;
export const CONSENT_EVENT = "nesja:consent-changed";
export const OPEN_CONSENT_EVENT = "nesja:open-consent";

export const defaultConsent = (): ConsentState => ({ version: CONSENT_VERSION, decided: false, necessary: true, analytics: false, marketing: false, updatedAt: "" });

export function readConsent(): ConsentState {
  if (typeof document === "undefined") return defaultConsent();
  const raw = document.cookie.split("; ").find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!raw) return defaultConsent();
  try {
    const parsed = JSON.parse(decodeURIComponent(raw.split("=").slice(1).join("="))) as ConsentState;
    if (parsed.version !== CONSENT_VERSION) return defaultConsent();
    return { ...parsed, necessary: true };
  } catch {
    return defaultConsent();
  }
}

export function writeConsent(choice: Pick<ConsentState, "analytics" | "marketing">) {
  const state: ConsentState = { version: CONSENT_VERSION, decided: true, necessary: true, ...choice, updatedAt: new Date().toISOString() };
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(state))}; Path=/; Max-Age=${60 * 60 * 24 * 180}; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent<ConsentState>(CONSENT_EVENT, { detail: state }));
  return state;
}

export const openConsentPreferences = () => window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
