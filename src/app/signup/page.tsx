import type { Metadata } from "next";
import { features } from "@/config/site";
import { PageHero } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Start with NESJA", description: "Get started with NESJA.OS.", path: "/signup", noIndex: true });

/**
 * Self-serve entry point. Hidden from navigation until
 * NEXT_PUBLIC_FEATURE_SELF_SERVE=true and PAYMENT_PROVIDER is configured.
 */
export default function SignupPage() {
  return (
    <PageHero eyebrow="Get started" title={features.selfServeSignup ? "Start your NESJA trial." : "Self-serve sign-up is on its way."}
      intro={features.selfServeSignup ? "Choose an edition on the pricing page to begin." : "Today every NESJA deployment starts with a short conversation, so your environment is configured around your commercial process. Book a demo and we'll set you up."}>
      <ButtonLink href={features.selfServeSignup ? "/pricing" : "/book-demo"} size="lg" arrow>{features.selfServeSignup ? "Choose an edition" : "Book a Demo"}</ButtonLink>
    </PageHero>
  );
}
