/**
 * Analytics provider adapters. Each provider is optional and activated by
 * NEXT_PUBLIC_ANALYTICS_PROVIDERS (comma-separated) plus its own ID env var.
 * The UI never imports a provider directly — only src/lib/analytics/index.ts.
 *
 * Script snippets follow each vendor's documented loader; verify against the
 * vendor's current docs when enabling in production.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = Record<string, unknown>;

export interface AnalyticsProvider {
  id: string;
  /** Consent category required before load/track. */
  category: "analytics" | "marketing";
  isConfigured: () => boolean;
  load: () => void;
  track: (event: string, props: Props) => void;
  page: (path: string) => void;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    analytics?: any;
    posthog?: any;
    mixpanel?: any;
    _hsq?: unknown[];
  }
}

const injectScript = (id: string, src: string, attrs: Record<string, string> = {}) => {
  if (document.getElementById(id)) return;
  const s = document.createElement("script");
  s.id = id;
  s.async = true;
  s.src = src;
  Object.entries(attrs).forEach(([k, v]) => s.setAttribute(k, v));
  document.head.appendChild(s);
};

const env = {
  gtm: process.env.NEXT_PUBLIC_GTM_ID,
  ga4: process.env.NEXT_PUBLIC_GA4_ID,
  segment: process.env.NEXT_PUBLIC_SEGMENT_WRITE_KEY,
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
  mixpanel: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  hubspot: process.env.NEXT_PUBLIC_HUBSPOT_PORTAL_ID,
};

export const consoleProvider: AnalyticsProvider = {
  id: "console",
  category: "analytics",
  isConfigured: () => process.env.NODE_ENV !== "production",
  load: () => {},
  track: (event, props) => console.info(`%c[analytics] ${event}`, "color:#12C6C2", props),
  page: (path) => console.info(`%c[analytics] page_view`, "color:#4B6BFF", { path }),
};

export const gtmProvider: AnalyticsProvider = {
  id: "gtm",
  category: "analytics",
  isConfigured: () => !!env.gtm,
  load: () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    injectScript("nesja-gtm", `https://www.googletagmanager.com/gtm.js?id=${env.gtm}`);
  },
  track: (event, props) => window.dataLayer?.push({ event, ...props }),
  page: (path) => window.dataLayer?.push({ event: "page_view", page_path: path }),
};

export const ga4Provider: AnalyticsProvider = {
  id: "ga4",
  category: "analytics",
  isConfigured: () => !!env.ga4,
  load: () => {
    window.dataLayer = window.dataLayer || [];
    // gtag must push the `arguments` object itself (Google tag requirement).
    // eslint-disable-next-line prefer-rest-params
    window.gtag = function gtag() { window.dataLayer!.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", env.ga4, { send_page_view: false });
    injectScript("nesja-ga4", `https://www.googletagmanager.com/gtag/js?id=${env.ga4}`);
  },
  track: (event, props) => window.gtag?.("event", event, props),
  page: (path) => window.gtag?.("event", "page_view", { page_path: path }),
};

export const segmentProvider: AnalyticsProvider = {
  id: "segment",
  category: "analytics",
  isConfigured: () => !!env.segment,
  load: () => {
    // Minimal queue stub; calls replay once analytics.js loads.
    const queue: any[] = [];
    const stub: any = { _q: queue };
    ["track", "page", "identify"].forEach((m) => (stub[m] = (...a: unknown[]) => queue.push([m, ...a])));
    window.analytics = window.analytics || stub;
    const s = document.createElement("script");
    s.id = "nesja-segment";
    s.async = true;
    s.src = `https://cdn.segment.com/analytics.js/v1/${env.segment}/analytics.min.js`;
    s.onload = () => { queue.forEach(([m, ...a]) => window.analytics?.[m]?.(...a)); };
    if (!document.getElementById(s.id)) document.head.appendChild(s);
  },
  track: (event, props) => window.analytics?.track?.(event, props),
  page: (path) => window.analytics?.page?.(path),
};

export const posthogProvider: AnalyticsProvider = {
  id: "posthog",
  category: "analytics",
  isConfigured: () => !!env.posthogKey,
  load: () => {
    const s = document.createElement("script");
    s.id = "nesja-posthog";
    s.async = true;
    s.src = `${env.posthogHost.replace(".i.posthog.com", "-assets.i.posthog.com")}/static/array.js`;
    s.onload = () => window.posthog?.init?.(env.posthogKey, { api_host: env.posthogHost, capture_pageview: false });
    if (!document.getElementById(s.id)) document.head.appendChild(s);
  },
  track: (event, props) => window.posthog?.capture?.(event, props),
  page: (path) => window.posthog?.capture?.("$pageview", { $current_url: path }),
};

export const mixpanelProvider: AnalyticsProvider = {
  id: "mixpanel",
  category: "analytics",
  isConfigured: () => !!env.mixpanel,
  load: () => {
    const s = document.createElement("script");
    s.id = "nesja-mixpanel";
    s.async = true;
    s.src = "https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";
    s.onload = () => window.mixpanel?.init?.(env.mixpanel, { track_pageview: false });
    if (!document.getElementById(s.id)) document.head.appendChild(s);
  },
  track: (event, props) => window.mixpanel?.track?.(event, props),
  page: (path) => window.mixpanel?.track?.("page_view", { path }),
};

export const hubspotProvider: AnalyticsProvider = {
  id: "hubspot",
  category: "marketing",
  isConfigured: () => !!env.hubspot,
  load: () => {
    window._hsq = window._hsq || [];
    injectScript("hs-script-loader", `https://js.hs-scripts.com/${env.hubspot}.js`, { defer: "true" });
  },
  track: (event, props) => window._hsq?.push(["trackCustomBehavioralEvent", { name: event, properties: props }]),
  page: (path) => { window._hsq?.push(["setPath", path]); window._hsq?.push(["trackPageView"]); },
};

export const allProviders: AnalyticsProvider[] = [consoleProvider, gtmProvider, ga4Provider, segmentProvider, posthogProvider, mixpanelProvider, hubspotProvider];
