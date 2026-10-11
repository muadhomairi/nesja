import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { CookieSettingsButton } from "@/components/analytics/CookieConsent";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Section";
import { legalUpdated } from "@/config/legal";

export const metadata: Metadata = buildMetadata({ title: "Cookie Policy", description: "How nesja.ai uses cookies and similar technologies, why, and the choices available to you.", path: "/cookies" });

export default function CookiesPage() {
  return (
    <>
      <LegalPage title="Cookie Policy" updated={legalUpdated}
        intro="This Cookie Policy explains how nesja.ai uses cookies and similar technologies, the purposes for which they are used, and the choices available to you."
        blocks={[
          { type: "h2", text: "Necessary" },
          { type: "p", text: "These are required for the website to work and are always on." },
          { type: "list", items: [
            "nesja_consent (first-party cookie, 6 months): remembers your cookie choices.",
            "nesja_attribution_v1 (session storage): records how you arrived during this visit (campaign parameters, referring website and landing page) so an enquiry you choose to submit can be attributed. Cleared when you close the tab.",
          ] },
          { type: "h2", text: "Analytics (only with your consent)" },
          { type: "p", text: "If you accept analytics, the analytics tools we have enabled may set their own cookies to measure how pages are used. With analytics or marketing consent, the attribution record above is kept in local storage instead, so returning visits are recognised. No analytics tool loads before you make a choice." },
          { type: "h2", text: "Marketing (only with your consent)" },
          { type: "p", text: "If you accept marketing, campaign measurement tools may set cookies to understand which campaigns brought you to NESJA. No marketing tool loads before you make a choice." },
          { type: "h2", text: "Your choices" },
          { type: "p", text: "When you first visit, you can accept all, keep necessary only, or customise. You can change your choices at any time using Cookie Settings in the footer or the button below. You can also block or delete cookies in your browser settings; the website will still work, but your cookie choice will not be remembered." },
          { type: "h2", text: "Changes to this policy" },
          { type: "p", text: "We update this policy when the cookies or similar technologies we use change. The date at the top of this page shows when it was last updated." },
        ]} />
      <Container className="-mt-16 max-w-3xl pb-24"><span className="inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-cloud hover:border-white/30"><CookieSettingsButton /></span></Container>
    </>
  );
}
