import type { Metadata } from "next";
import { DemoWizard } from "@/components/demo/DemoWizard";
import { Container } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Book a Demo",
  description: "Book a NESJA.OS product demonstration tailored to your organisation: your use cases, your deployment and your commercial requirements.",
  path: "/book-demo",
});

const expect = [
  { icon: "users", t: "Tailored to your organisation", b: "We focus on your use cases and the commercial motions that matter most to you." },
  { icon: "pipeline", t: "The product, live", b: "From first signal to signed contract, demonstrated in NESJA.OS." },
  { icon: "globe", t: "Deployment, discussed", b: "Deployment model, integrations, security and implementation for your environment." },
  { icon: "quote", t: "Commercial requirements", b: "Editions, users and terms, and the next step to a proposal." },
];

export default function BookDemoPage() {
  return (
    <section className="relative overflow-hidden pb-24 pt-28 md:pt-36">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" aria-hidden="true" />
      <Container className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        <div className="lg:pt-6">
          <p className="eyebrow mb-4">Book a Demo</p>
          <h1 className="text-display-lg text-cloud">See NESJA in action.</h1>
          <p className="mt-5 text-lg leading-relaxed text-mist">A 30-minute product demonstration with a NESJA specialist, tailored to your organisation, your use cases and your deployment.</p>
          <ul className="mt-10 hidden space-y-6 lg:block">
            {expect.map((e) => (
              <li key={e.t} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal/10 text-teal"><Icon name={e.icon} /></span>
                <span><span className="block font-semibold text-cloud">{e.t}</span><span className="text-sm text-mist">{e.b}</span></span>
              </li>
            ))}
          </ul>
        </div>
        <div><DemoWizard /></div>
        <ul className="space-y-5 lg:hidden">
          {expect.map((e) => (
            <li key={e.t} className="flex gap-4"><Icon name={e.icon} className="h-5 w-5 shrink-0 text-teal" /><span><span className="block font-semibold text-cloud">{e.t}</span><span className="text-sm text-mist">{e.b}</span></span></li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
