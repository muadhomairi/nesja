import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/sora";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "./globals.css";
import { getLocale } from "@/lib/i18n";
import Script from "next/script";
import { themeScript } from "@/components/shell/theme-toggle";

export const metadata: Metadata = { title: { default: "NESJA.OS", template: "%s · NESJA.OS" }, description: "NESJA.OS: the commercial operating system.", robots: { index: false, follow: false } };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} suppressHydrationWarning>
      <body>
        <Script id="nesja-theme" strategy="beforeInteractive">{themeScript}</Script>
        {children}
      </body>
    </html>
  );
}
