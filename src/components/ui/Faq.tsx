/** Native <details> accordion: accessible and works without JavaScript. */
export function Faq({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-white/[0.07] rounded-2xl border border-white/[0.07]">
      {items.map((f) => (
        <details key={f.q} className="group px-6 py-1 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-cloud">
            {f.q}
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 text-mist transition-transform group-open:rotate-45" aria-hidden="true">+</span>
          </summary>
          <p className="pb-5 leading-relaxed text-mist">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
