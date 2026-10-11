import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { modules } from "@/config/modules";
import { roles } from "@/config/roles";
import { industries } from "@/config/industries";
import { resources } from "@/config/resources";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority = 0.7): MetadataRoute.Sitemap[number] => ({ url: `${siteConfig.url}${path}`, lastModified: now, changeFrequency: "weekly", priority });
  return [
    page("/", 1), page("/platform", 0.9), page("/pricing", 0.9), page("/book-demo", 0.9),
    ...modules.map((m) => page(`/platform/${m.slug}`, 0.8)),
    page("/solutions", 0.8), ...roles.map((r) => page(`/solutions/${r.slug}`)),
    page("/industries", 0.8), ...industries.map((i) => page(`/industries/${i.slug}`)),
    page("/resources", 0.7), ...resources.map((r) => page(`/resources/${r.slug}`, r.featured ? 0.8 : 0.6)),
    page("/customers", 0.5), page("/about", 0.6), page("/security", 0.7), page("/contact", 0.8), page("/integrations", 0.6),
    page("/partners", 0.5),
    page("/privacy", 0.2), page("/terms", 0.2), page("/cookies", 0.2),
  ];
}
