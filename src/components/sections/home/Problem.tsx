import { problem } from "@/content/home";
import { Container } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";

export function Problem() {
  return (
    <section id="problem" aria-labelledby="problem-title" className="relative py-24 md:py-32">
      <Container>
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">{problem.eyebrow}</p>
          <h2 id="problem-title" className="text-display-lg text-cloud">
            {problem.headline[0]} <span className="text-mist">{problem.headline[1]}</span>
          </h2>
        </div>

        {/* Fragmented flow: each hop is a manual handoff */}
        <ol aria-label="A typical fragmented commercial process" className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {problem.flow.map((step, i) => (
            <li key={step} className="relative">
              <div className="flex h-full flex-col justify-between rounded-xl border border-dashed border-white/[0.12] bg-midnight-800/40 p-4">
                <span className="text-xs font-medium text-mist">System {i + 1}</span>
                <span className="mt-6 text-sm font-semibold text-silver">{step}</span>
              </div>
              {i < problem.flow.length - 1 && (
                <span aria-hidden="true" className="absolute -end-[0.6rem] top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-midnight text-[0.6rem] text-rose-300/80 lg:flex">⟂</span>
              )}
            </li>
          ))}
        </ol>
        <p className="mt-4 text-sm text-mist">Every arrow is a manual handoff: re-keyed data, a lost note, a delay.</p>

        <ul className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
          {problem.issues.map((issue) => (
            <li key={issue.title} className="bg-midnight p-6 transition-colors hover:bg-midnight-800/80">
              <Icon name="alert" className="h-5 w-5 text-rose-300/70" />
              <h3 className="mt-4 font-semibold text-cloud">{issue.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-mist">{issue.body}</p>
            </li>
          ))}
        </ul>

        <div className="mt-24 text-center md:mt-32">
          <p className="text-display-lg text-cloud">
            {problem.resolution.map((line, i) => (
              <span key={line} className={i === 2 ? "block text-gradient" : "block"}>{line}</span>
            ))}
          </p>
        </div>
      </Container>
    </section>
  );
}
