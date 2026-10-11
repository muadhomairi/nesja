import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/LegalPage";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Privacy Policy", description: "How NESJA collects and uses personal information on this website.", path: "/privacy" });

export default function PrivacyPage() {
  return <LegalPage title="Privacy Policy" updated="8 October 2026" blocks={[
    { type: "h2", text: "What we collect" },
    { type: "p", text: "When you book a demo, contact sales or subscribe, we collect the details you enter: your name, work email, company, role and any message or preferences you provide." },
    { type: "p", text: "We also record how you reached the site (campaign parameters, referring website and landing page) so we can understand which channels are useful. With your consent, analytics tools record how pages are used." },
    { type: "h2", text: "How we use it" },
    { type: "list", items: ["To arrange and hold the meeting you booked", "To respond to your enquiry", "To send resources you subscribed to (you can unsubscribe at any time)", "To improve the website, where you have consented to analytics"] },
    { type: "h2", text: "Sharing" },
    { type: "p", text: "We use service providers for scheduling, email delivery and, with your consent, analytics. They process data on our behalf and under contract. We do not sell personal information." },
    { type: "h2", text: "Your rights" },
    { type: "p", text: "You can ask to access, correct or delete your personal information, or withdraw consent, by contacting us through the contact page." },
  ]} />;
}
