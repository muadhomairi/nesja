/** Metadata + structured-data helpers so every page is SEO-complete by default. */
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface MetaInput { title: string; description: string; path: string; noIndex?: boolean; ogType?: "website" | "article" }

export function buildMetadata({ title, description, path, noIndex, ogType = "website" }: MetaInput): Metadata {
  const url = `${siteConfig.url}${path === "/" ? "" : path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, siteName: siteConfig.name, type: ogType, locale: "en_GB" },
    twitter: { card: "summary_large_image", title, description },
    robots: noIndex ? { index: false, follow: true } : undefined,
  };
}

export const organizationJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/icon.svg`,
  slogan: siteConfig.tagline,
  sameAs: Object.values(siteConfig.social).filter((u) => u.startsWith("https://")),
});

export const softwareJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Commercial Operating System",
  operatingSystem: "Web",
  description: siteConfig.description,
  url: siteConfig.url,
});

export const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: `${siteConfig.url}${it.path}` })),
});

export const articleJsonLd = (a: { title: string; description: string; path: string; publishedAt: string }) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: a.title,
  description: a.description,
  datePublished: a.publishedAt,
  mainEntityOfPage: `${siteConfig.url}${a.path}`,
  publisher: { "@type": "Organization", name: siteConfig.name },
});
