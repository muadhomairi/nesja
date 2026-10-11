/**
 * Provider-independent analytics layer.
 *
 *   import { track } from "@/lib/analytics";
 *   track("pricing_duration_changed", { term: "24m", edition: "essential" });
 *
 * Events are queued until the visitor has made a consent choice, then
 * delivered only to providers whose consent category is granted.
 */
import type { AnalyticsEventMap, AnalyticsEventName } from "./events";
import { allProviders, type AnalyticsProvider } from "./providers";
import { readConsent, type ConsentState } from "../consent";

const enabledIds = (process.env.NEXT_PUBLIC_ANALYTICS_PROVIDERS || "console")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const providers = allProviders.filter((p) => enabledIds.includes(p.id) && p.isConfigured());
const loaded = new Set<string>();
type Item = { kind: "event" | "page"; name: string; props: Record<string, unknown> };
/** Events held until the visitor decides on consent (capped). */
const pending: Item[] = [];
let consent: ConsentState | null = null;

const permitted = (p: AnalyticsProvider) =>
  !!consent && (p.id === "console" || (consent.decided && consent[p.category]));

const send = (p: AnalyticsProvider, item: Item) => {
  try { if (item.kind === "page") p.page(item.name); else p.track(item.name, item.props); } catch { /* provider errors never break the UI */ }
};

function loadPermitted() {
  providers.forEach((p) => {
    if (permitted(p) && !loaded.has(p.id)) {
      try { p.load(); loaded.add(p.id); } catch (e) { console.warn(`[analytics] ${p.id} failed to load`, e); }
    }
  });
}

function dispatch(item: Item) {
  if (!consent) consent = readConsent();
  loadPermitted();
  providers.filter((p) => loaded.has(p.id)).forEach((p) => send(p, item));
  if (!consent.decided && pending.length < 100) pending.push(item);
}

/** Called by <AnalyticsRoot> on mount and whenever consent changes. */
export function setAnalyticsConsent(next: ConsentState) {
  const before = new Set(loaded);
  consent = next;
  loadPermitted();
  if (next.decided) {
    // Replay held events to providers that were just enabled (console already saw them).
    const fresh = providers.filter((p) => loaded.has(p.id) && !before.has(p.id));
    pending.splice(0).forEach((item) => fresh.forEach((p) => send(p, item)));
  }
}

export function track<E extends AnalyticsEventName>(name: E, props: AnalyticsEventMap[E] = {} as AnalyticsEventMap[E]) {
  if (typeof window === "undefined") return;
  dispatch({ kind: "event", name, props: { ...props, path: window.location.pathname } });
}

export function trackPage(path: string) {
  if (typeof window === "undefined") return;
  dispatch({ kind: "page", name: path, props: {} });
}

export const activeAnalyticsProviders = () => providers.map((p) => p.id);
export type { AnalyticsEventName, AnalyticsEventMap };
