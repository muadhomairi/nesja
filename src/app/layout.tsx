import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import { siteConfig } from "@/config/site";
import { defaultLocale, getDirection } from "@/i18n";
import { getLocale } from "@/config/locales";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CookieConsent } from "@/components/analytics/CookieConsent";
import { AnalyticsRoot } from "@/components/analytics/AnalyticsRoot";
import { JsonLd } from "@/components/layout/JsonLd";
import { organizationJsonLd } from "@/lib/seo";

const manrope = localFont({
  src: [
    { path: "../fonts/manrope-latin-wght-normal.woff2", weight: "200 800", style: "normal" },
    { path: "../fonts/manrope-latin-ext-wght-normal.woff2", weight: "200 800", style: "normal" },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: `${siteConfig.name} — ${siteConfig.category}`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: ["Commercial Operating System", "Commercial Management Software", "Revenue Operations Platform", "Sales Management Platform", "CPQ Software", "Contract Management", "Customer Success Platform", "Commercial Intelligence", "AI Sales Platform"],
  openGraph: { siteName: siteConfig.name, type: "website", locale: "en_GB" },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = { themeColor: "#0C1324", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale(defaultLocale);
  return (
    <html lang={locale.htmlLang} dir={getDirection(defaultLocale)} className={manrope.variable}>
      <body className="min-h-screen font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-teal focus:px-5 focus:py-2.5 focus:font-semibold focus:text-midnight">
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1} className="outline-none">{children}</main>
        <Footer />
        <CookieConsent />
        <Suspense fallback={null}><AnalyticsRoot /></Suspense>
        <JsonLd data={organizationJsonLd()} />
      </body>
    </html>
  );
}
