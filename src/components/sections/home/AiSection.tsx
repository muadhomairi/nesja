import { aiCapabilities } from "@/content/home";
import { Container } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";

const lifecycle = [
  { stage: "Lead", insight: "Fit and intent scoring" },
  { stage: "Opportunity", insight: "Risk detection and next-best action" },
  { stage: "Quote", insight: "Bundle and pricing guidance" },
  { stage: "Contract", insight: "Obligation and clause insights" },
  { stage: "Customer", insight: "Health and sentiment signals" },
  { stage: "Leadership", insight: "Forecasts and executive summaries" },
];

export function AiSection() {
  return (
    <section id="ai" aria-labelledby="ai-title" className="relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute start-1/2 top-1/3 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-signal/[0.10] blur-[140px] rtl:translate-x-1/2" aria-hidden="true" />
      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-4 justify-center"><Icon name="sparkle" className="h-4 w-4" /> NESJA AI</p>
          <h2 id="ai-title" className="text-display-lg text-cloud">Intelligence woven into every commercial motion.</h2>
          <p className="mt-6 text-lg leading-relaxed text-mist">NESJA AI works across the commercial lifecycle rather than inside a standalone assistant.</p>
        </div>

        <div className="relative mt-16">
        <div className="absolute inset-x-6 top-[1.6rem] hidden h-px bg-gradient-to-r from-signal/0 via-signal/60 to-teal/0 lg:block" aria-hidden="true" />
        <ol className="relative grid gap-3 sm:grid-cols-2 lg:grid-cols-6" aria-label="AI across the commercial lifecycle">
          {lifecycle.map((l, i) => (
            <li key={l.stage} className="relative flex flex-col items-start gap-3 rounded-2xl border border-white/[0.07] bg-midnight-800/50 p-4 lg:items-center lg:border-0 lg:bg-transparent lg:p-0 lg:text-center">
              <span className="relative z-10 flex h-[3.2rem] w-[3.2rem] items-center justify-center rounded-2xl border border-signal/40 bg-midnight-800 text-sm font-semibold text-cloud">
                <Icon name="sparkle" className="h-5 w-5 animate-pulse-soft text-signal-soft" style={{ animationDelay: `${i * 0.4}s` }} />
              </span>
              <div>
                <p className="font-semibold text-cloud">{l.stage}</p>
                <p className="mt-1 text-sm leading-snug text-mist">{l.insight}</p>
              </div>
            </li>
          ))}
        </ol>
        </div>

        <ul className="mx-auto mt-16 flex max-w-4xl flex-wrap justify-center gap-2" aria-label="NESJA AI capabilities">
          {aiCapabilities.map((c) => (
            <li key={c} className="rounded-full border border-white/[0.08] bg-white/[0.02] px-3.5 py-1.5 text-sm text-silver">{c}</li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
