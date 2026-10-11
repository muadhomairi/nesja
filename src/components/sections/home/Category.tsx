import { category } from "@/content/home";
import { Container } from "@/components/ui/Section";
import { Icon } from "@/components/ui/Icon";

export function Category() {
  return (
    <section id="category" aria-labelledby="category-title" className="relative border-t border-white/[0.06] bg-midnight-900/40 py-24 md:py-32">
      <Container className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="eyebrow mb-4">{category.eyebrow}</p>
          <h2 id="category-title" className="text-display-md text-cloud">{category.headline}</h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-mist">{category.body}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
          <ul className="space-y-2.5" aria-label="Point solutions">
            {category.rows.map((r) => (
              <li key={r.name} className="rounded-xl border border-white/[0.07] bg-midnight-800/50 px-4 py-3">
                <p className="text-sm font-semibold text-silver">{r.name}</p>
                <p className="text-sm text-mist">{r.does}</p>
              </li>
            ))}
          </ul>
          <div className="hidden items-center sm:flex" aria-hidden="true">
            <svg width="56" height="100%" viewBox="0 0 56 300" preserveAspectRatio="none" className="h-full">
              {[30, 90, 150, 210, 270].map((y) => <path key={y} d={`M0 ${y} C 30 ${y}, 26 150, 56 150`} stroke="rgb(var(--teal) / 0.55)" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" />)}
            </svg>
          </div>
          <div className="relative flex flex-col justify-center overflow-hidden rounded-2xl border border-teal/40 bg-gradient-to-br from-teal/[0.12] via-midnight-800 to-signal/[0.12] p-7 shadow-glow">
            <p className="text-xl font-bold tracking-wide text-cloud">NESJA<span className="text-teal">.OS</span></p>
            <p className="mt-2 text-[0.9375rem] font-medium text-silver">{category.nesja.does}</p>
            <ul className="mt-6 space-y-2.5 text-sm text-silver">
              {["One data model", "One governed process", "One intelligence layer"].map((x) => (
                <li key={x} className="flex items-center gap-2"><Icon name="check" className="h-4 w-4 text-teal" /> {x}</li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
