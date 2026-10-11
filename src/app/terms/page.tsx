import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Terms of Use", description: "Terms governing use of the NESJA website.", path: "/terms" });

export default function TermsPage() {
  return <LegalPage title="Terms of Use" updated="8 October 2026" blocks={[
    { type: "h2", text: "About these terms" },
    { type: "p", text: "These terms govern your use of this website. Use of the NESJA.OS product is governed by the agreement between NESJA and your organisation." },
    { type: "h2", text: "Information on this site" },
    { type: "p", text: "We aim to keep information accurate and current. Product screens shown on this site use sample data for illustration. Prices shown are indicative until confirmed in a written proposal or order." },
    { type: "h2", text: "Intellectual property" },
    { type: "p", text: "The NESJA name, logo and site content belong to NESJA. Third-party names are trademarks of their respective owners and are used for identification only." },
    { type: "h2", text: "Contact" },
    { type: "p", text: "Questions about these terms can be sent through the contact page." },
  ]} />;
}
