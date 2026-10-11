import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { buildMetadata } from "@/lib/seo";
import { companyFacts, legalUpdated } from "@/config/legal";

export const metadata: Metadata = buildMetadata({ title: "Privacy Policy", description: "How NESJA handles personal information when you visit nesja.ai, contact us, request a demonstration, submit a commercial enquiry or subscribe to communications.", path: "/privacy" });

const contactLine = companyFacts.privacyEmail
  ? `To make a request, email ${companyFacts.privacyEmail} or use our contact page.`
  : "To make a request, use our contact page and choose \"General enquiry\".";

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" updated={legalUpdated} showCompanyDetails
    intro="This Privacy Policy explains how NESJA handles personal information when you visit nesja.ai, contact us, request a demonstration, submit a commercial enquiry or subscribe to communications."
    blocks={[
      { type: "h2", text: "Information you provide" },
      { type: "h3", text: "Demo requests" },
      { type: "p", text: "When you request a demonstration we collect your work email, name, company, the size of your commercial team, the area you would most like to see, your preferred date, time and timezone, and, if you came from the pricing page, the edition, term and number of users you selected." },
      { type: "h3", text: "Contact and commercial enquiries" },
      { type: "p", text: "When you contact us we collect the enquiry type, your name, work email, company, role and message. For enterprise enquiries you may also choose to give your country, company size and estimated number of users." },
      { type: "h3", text: "Newsletter subscriptions" },
      { type: "p", text: "When you subscribe to NESJA Perspectives we collect your email address and where on the site you subscribed." },
      { type: "h2", text: "Technical information" },
      { type: "p", text: "When you submit a form, we record the time of submission, your browser's user-agent string and the page you submitted from. Our servers process your IP address to deliver the website and to limit repeated submissions; we do not store it with your enquiry. Our hosting provider keeps standard server logs for operating and securing the website." },
      { type: "h2", text: "Attribution information" },
      { type: "p", text: "To understand which channels bring people to NESJA, we record how you arrived: campaign (UTM) parameters, the referring website, the page you landed on, and when. This is kept in your browser for the current visit only, unless you accept analytics or marketing cookies, in which case it is kept so returning visits can be recognised. It is sent to us only if you submit a form." },
      { type: "h2", text: "Cookies" },
      { type: "p", text: "We use a necessary cookie to remember your cookie choices. Analytics and marketing tools load only if you consent to them. Our Cookie Policy lists what we use and how to change your choices at any time." },
      { type: "h2", text: "How we use information" },
      { type: "list", items: [
        "To respond to your enquiry and to discuss your requirements",
        "To arrange, prepare and hold the demonstration you requested",
        "To prepare commercial proposals you ask for",
        "To send communications you subscribed to, until you unsubscribe",
        "To understand which pages and channels are useful, where you have consented to analytics or marketing",
        "To operate, secure and protect the website, including preventing spam and abuse",
      ] },
      { type: "p", text: "We do not sell personal information, and we do not use your information for automated decision-making that has legal or similarly significant effects on you." },
      { type: "h2", text: "Service providers" },
      { type: "p", text: "We use service providers to host the website and, where enabled, to manage enquiries, schedule meetings, send email and measure website use. They process personal information on our behalf, under our instructions, and only for those purposes. Some service providers may process information outside your country; where they do, we take steps to ensure your information remains protected." },
      { type: "h2", text: "Retention" },
      { type: "p", text: "We keep enquiry and demonstration information for as long as needed to respond to you and to manage any resulting commercial relationship, and subscription details until you unsubscribe. When information is no longer needed, we delete or anonymise it." },
      { type: "h2", text: "Security" },
      { type: "p", text: "The website is served over encrypted connections (HTTPS), and access to enquiry information is limited to the people and service providers who need it. No method of transmission or storage is completely secure, but we take reasonable technical and organisational measures to protect your information." },
      { type: "h2", text: "Your rights and choices" },
      { type: "p", text: "Depending on where you live, you may have the right to access, correct or delete your personal information, to object to or restrict how we use it, to receive a copy of it, and to withdraw consent at any time. You can change cookie choices through Cookie Settings in the footer and unsubscribe from communications at any time. " + contactLine },
      { type: "h2", text: "Changes to this policy" },
      { type: "p", text: "We may update this policy as the website or our practices change. The date at the top of this page shows when it was last updated." },
      { type: "h2", text: "Contacting NESJA" },
      { type: "p", text: companyFacts.privacyEmail ? `Questions about this policy can be sent to ${companyFacts.privacyEmail} or through our contact page.` : "Questions about this policy can be sent through our contact page." },
    ]} />;
}
