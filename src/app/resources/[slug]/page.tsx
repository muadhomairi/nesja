import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getResource, resources, resourceTypeLabel, type Block } from "@/config/resources";
import { Container, Badge } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { PrintButton } from "@/components/sections/PrintButton";
import { FinalCta } from "@/components/sections/FinalCta";
import { JsonLd } from "@/components/layout/JsonLd";
import { articleJsonLd, buildMetadata } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export const generateStaticParams = () => resources.map((r) => ({ slug: r.slug }));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const r = getResource((await params).slug);
  if (!r) return {};
  return buildMetadata({ title: r.title, description: r.excerpt, path: `/resources/${r.slug}`, ogType: "article" });
}

function RenderBlock({ b }: { b: Block }) {
  switch (b.type) {
    case "h2": return <h2>{b.text}</h2>;
    case "h3": return <h3>{b.text}</h3>;
    case "quote": return <blockquote>{b.text}</blockquote>;
    case "list": return <ul>{b.items.map((i) => <li key={i}>{i}</li>)}</ul>;
    default: return <p>{b.text}</p>;
  }
}

export default async function ResourcePage({ params }: Params) {
  const r = getResource((await params).slug);
  if (!r) notFound();
  return (
    <>
      <article className="pb-16 pt-32 md:pt-40">
        <Container className="max-w-3xl">
          <Link href="/resources" className="inline-flex items-center gap-1.5 text-sm text-mist hover:text-cloud" data-print-hidden><Icon name="arrowLeft" className="h-4 w-4 rtl:-scale-x-100" /> Resources</Link>
          <div className="mt-8"><Badge tone="teal">{resourceTypeLabel(r.type)}</Badge></div>
          <h1 className="mt-5 text-display-lg text-cloud">{r.title}</h1>
          <p className="mt-5 text-xl leading-relaxed text-silver">{r.excerpt}</p>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-white/[0.07] py-4 text-sm text-mist">
            <span>NESJA · {new Date(r.publishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · {r.readingMinutes} min read</span>
            {r.printable && <PrintButton slug={r.slug} />}
          </div>
          <div className="prose-nesja mt-10">{r.body.map((b, i) => <RenderBlock key={i} b={b} />)}</div>
        </Container>
      </article>
      <FinalCta location={`resource-${r.slug}`} />
      <JsonLd data={articleJsonLd({ title: r.title, description: r.excerpt, path: `/resources/${r.slug}`, publishedAt: r.publishedAt })} />
    </>
  );
}
