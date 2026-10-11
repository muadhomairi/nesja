import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { CookieSettingsButton } from "@/components/analytics/CookieConsent";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Section";

export const metadata: Metadata = buildMetadata({ title: "Cookie Policy", description: "The cookies and storage this website uses, and how to change your choices.", path: "/cookies" });

export default function CookiesPage() {
  return (
    <>
      <LegalPage title="Cookie Policy" updated="8 October 2026" blocks={[
        { type: "h2", text: "Necessary" },
        { type: "list", items: ["nesja_consent (cookie, 6 months): remembers your cookie choices.", "nesja_attribution_v1 (session storage): records how you arrived during this visit so an enquiry you submit can be attributed. Cleared when you close the tab."] },
        { type: "h2", text: "Analytics (only with consent)" },
        { type: "p", text: "If you accept analytics, the analytics tools we have enabled may set their own cookies to measure page usage. With consent, attribution is kept in local storage so returning visits are recognised." },
        { type: "h2", text: "Marketing (only with consent)" },
        { type: "p", text: "If you accept marketing, campaign measurement tools may set cookies to understand which campaigns brought you to us." },
        { type: "h2", text: "Changing your choices" },
        { type: "p", text: "You can change your choices at any time using the Cookie settings link in the footer or the button below." },
      ]} />
      <Container className="-mt-16 max-w-3xl pb-24"><span className="inline-flex rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-cloud hover:border-white/30"><CookieSettingsButton /></span></Container>
    </>
  );
}
