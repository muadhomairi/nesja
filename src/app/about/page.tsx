import type { Metadata } from "next";
import { PageHero, Section } from "@/components/ui/Section";
import { FinalCta } from "@/components/sections/FinalCta";
import { brandStatements } from "@/config/site";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "About NESJA",
  description: "NESJA comes from the Arabic نسج, to weave. We are building the Commercial Operating System that weaves every commercial thread into one intelligent fabric.",
  path: "/about",
});

const threads = ["People", "Customers", "Conversations", "Opportunities", "Proposals", "Contracts", "Relationships", "Data", "Decisions"];
const beliefs = [
  { t: "Connect", b: "Every commercial function should share one customer, one process and one source of truth." },
  { t: "Orchestrate", b: "Commercial policy belongs inside the work: in the quote, the approval and the contract." },
  { t: "Grow", b: "When the whole lifecycle is visible, organisations can decide faster and grow with confidence." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="About" title={<>{brandStatements.smarter}</>} intro="NESJA exists to give commercial organisations one intelligent system for the work that grows them." />
      <Section id="story" eyebrow="The name" title="NESJA, from نسج: to weave.">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-5 text-lg leading-relaxed text-mist">
            <p>Every business runs on threads. People and customers, conversations and opportunities, proposals and contracts, relationships, data and decisions.</p>
            <p>In most organisations those threads run through separate systems and separate teams. Each is strong on its own. Together they rarely hold.</p>
            <p className="text-cloud">NESJA.OS weaves them into one intelligent commercial fabric, so the organisation can operate as one.</p>
          </div>
          <div className="surface relative overflow-hidden p-8" aria-hidden="true">
            <svg viewBox="0 0 400 260" className="w-full">
              {threads.map((t, i) => {
                const y = 18 + i * 28;
                return (
                  <g key={t}>
                    <path d={`M 110 ${y} C 200 ${y}, 220 130, 330 130`} stroke={i % 2 ? "rgb(var(--signal) / .6)" : "rgb(var(--teal) / .7)"} strokeWidth="1.3" fill="none" className="flow-dash-slow" />
                    <text x="0" y={y + 4} fill="rgb(var(--silver))" fontSize="12" fontFamily="var(--font-sans)">{t}</text>
                  </g>
                );
              })}
              <circle cx="345" cy="130" r="16" fill="rgb(var(--teal) / .15)" stroke="rgb(var(--teal))" />
            </svg>
          </div>
        </div>
      </Section>
      <Section id="beliefs" className="border-t border-white/[0.06]" eyebrow="What we believe" title={brandStatements.verbs}>
        <ul className="grid gap-4 md:grid-cols-3">
          {beliefs.map((x) => <li key={x.t} className="surface p-7"><h3 className="text-xl font-semibold text-cloud">{x.t}</h3><p className="mt-3 leading-relaxed text-mist">{x.b}</p></li>)}
        </ul>
      </Section>
      <Section id="ambition" className="border-t border-white/[0.06]" eyebrow="Our ambition" title="A global commercial platform, built from the start for scale.">
        <p className="max-w-3xl text-lg leading-relaxed text-mist">We are building for organisations of every size and in every region: in the cloud, in dedicated environments and in sovereign deployments, in English today and in Arabic as we grow. The Commercial Operating System is a new category, and we intend to define it.</p>
      </Section>
      <FinalCta location="about-final" />
    </>
  );
}
