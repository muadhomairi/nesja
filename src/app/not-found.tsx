import { PageHero } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <PageHero eyebrow="404" title="This thread doesn't lead anywhere." intro="The page you're looking for has moved or doesn't exist.">
      <ButtonLink href="/" size="lg">Back to home</ButtonLink>
      <ButtonLink href="/platform" size="lg" variant="secondary">Explore the platform</ButtonLink>
    </PageHero>
  );
}
