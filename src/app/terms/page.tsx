import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { buildMetadata } from "@/lib/seo";
import { companyFacts, legalUpdated, publishedAgreements } from "@/config/legal";
import type { Block } from "@/config/resources";

export const metadata: Metadata = buildMetadata({ title: "Terms of Use", description: "The terms that govern your use of the NESJA.OS website and related online services.", path: "/terms" });

export default function TermsPage() {
  const agreements = publishedAgreements();
  const blocks: Block[] = [
    { type: "h2", text: "1. Website use" },
    { type: "p", text: "By accessing or using nesja.ai you agree to these Terms. If you use the website on behalf of an organisation, you confirm that you are authorised to accept these Terms for it. If you do not agree, please do not use the website." },
    { type: "h2", text: "2. Acceptable use" },
    { type: "p", text: "You agree not to:" },
    { type: "list", items: [
      "use the website in a way that breaks any applicable law or regulation;",
      "submit false, misleading or another person's information through our forms;",
      "attempt to gain unauthorised access to the website, its servers or connected systems;",
      "interfere with the website's operation, including through automated requests, scraping at volume, or introducing malicious code;",
      "use the website to send unsolicited communications or to harvest information about other users.",
    ] },
    { type: "h2", text: "3. Product information" },
    { type: "p", text: "The website describes the NESJA.OS Commercial Operating System, its modules and related services. Product screens on the website use sample data for illustration. Capabilities marked as roadmap are not currently available, and their scope and timing may change. The specific capabilities, deployment model and service levels that apply to a customer are those set out in that customer's agreement with NESJA." },
    { type: "h2", text: "4. Pricing information" },
    { type: "p", text: "Prices on the website are displayed in US dollars, per user per month, and exclude applicable taxes unless stated otherwise. Published prices and calculator results are for information. Fees become binding only when set out in a proposal, order form or other agreement accepted by both NESJA and the customer. Implementation and other services are scoped and priced separately." },
    { type: "h2", text: "5. Enquiries and demo requests" },
    { type: "p", text: "When you submit an enquiry, request a demonstration or subscribe to communications, you agree that the information you provide is accurate and that NESJA may use it to respond to you, as described in our Privacy Policy. Submitting an enquiry or requesting a demonstration does not create an obligation on you or on NESJA to enter into any agreement." },
    { type: "h2", text: "6. Intellectual property" },
    { type: "p", text: "The NESJA and NESJA.OS names and logos, and the content, design and software of the website, belong to NESJA or its licensors. You may view and print pages for your own information, including saving published resources as PDF. You may not otherwise copy, modify, distribute or commercially exploit website content without NESJA's written permission. Third-party names are trademarks of their respective owners and are used for identification only." },
    { type: "h2", text: "7. Third-party services" },
    { type: "p", text: "The website may link to, embed or rely on services operated by third parties, such as scheduling, email or calendar services. NESJA is not responsible for third-party websites or services, and your use of them is governed by their own terms and policies." },
    { type: "h2", text: "8. Website availability" },
    { type: "p", text: "We work to keep the website available and accurate, but we do not guarantee that it will be uninterrupted, error-free or available at any particular time. We may change, suspend or withdraw any part of the website without notice." },
    { type: "h2", text: "9. Disclaimers" },
    { type: "p", text: "The website and its content are provided for general information on an \"as is\" and \"as available\" basis. To the extent permitted by law, NESJA makes no warranties or representations about the website or its content, express or implied. Nothing on the website is legal, financial or other professional advice." },
    { type: "h2", text: "10. Limitation of liability" },
    { type: "p", text: "To the extent permitted by law, NESJA is not liable for any indirect or consequential loss, or for any loss of profit, revenue, data or goodwill, arising from your use of, or inability to use, the website. Nothing in these Terms limits liability that cannot be limited by law. These limitations apply to use of the website only; liability in relation to the NESJA.OS product and services is governed by the applicable customer agreement." },
    { type: "h2", text: "11. Separate customer agreements" },
    { type: "p", text: "These Terms apply to the website. Access to or use of the NESJA.OS product, implementation services or other commercial services may be governed by an applicable proposal, order form, statement of work, subscription agreement or other agreement between NESJA and the customer. Where such an agreement applies, it takes precedence over these Terms for the product and services it covers." },
    ...(agreements.length ? [{ type: "list" as const, items: agreements.map((a) => `${a.name}: ${a.purpose} (${a.url})`) }] : []),
    ...(companyFacts.governingLaw ? [{ type: "h2" as const, text: "12. Governing law" }, { type: "p" as const, text: `These Terms are governed by ${companyFacts.governingLaw}.` }] : []),
    { type: "h2", text: companyFacts.governingLaw ? "13. Changes to these Terms" : "12. Changes to these Terms" },
    { type: "p", text: "We may update these Terms from time to time. The date at the top of this page shows when they were last changed. Continued use of the website after a change means you accept the updated Terms." },
    { type: "h2", text: companyFacts.governingLaw ? "14. Contact" : "13. Contact" },
    { type: "p", text: companyFacts.legalEmail ? `Questions about these Terms can be sent to ${companyFacts.legalEmail} or through our contact page.` : "Questions about these Terms can be sent through our contact page." },
  ];
  return <LegalPage title="Terms of Use" updated={legalUpdated} showCompanyDetails
    intro="These Terms govern your use of the NESJA.OS website and related online services. Access to or use of the NESJA.OS product, implementation services or other commercial services may also be governed by an applicable proposal, order form, statement of work, subscription agreement or other agreement between NESJA and the customer."
    blocks={blocks} />;
}
