"use client";
/**
 * Interactive product journey: 12 steps from first signal to AI insight.
 * Keyboard: arrow keys move between steps (WAI-ARIA tabs pattern).
 * Autoplay only when visible, never under prefers-reduced-motion, and stops
 * permanently once the visitor interacts.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { journeySteps } from "@/content/journey";
import { modules } from "@/config/modules";
import { AppFrame } from "@/components/mockups/AppFrame";
import { journeyViews } from "@/components/mockups/views";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/cn";

const INTERVAL = 5200;

export function ProductJourney() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [userStopped, setUserStopped] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const step = journeySteps[index];
  const View = journeyViews[step.id];
  const mod = modules.find((m) => m.slug === step.module);

  useEffect(() => {
    if (userStopped) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !rootRef.current) return;
    const io = new IntersectionObserver(([e]) => setPlaying(e.isIntersecting), { threshold: 0.35 });
    io.observe(rootRef.current);
    return () => io.disconnect();
  }, [userStopped]);

  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % journeySteps.length), INTERVAL);
    return () => clearTimeout(t);
  }, [playing, index]);

  const go = useCallback((i: number, focus = false) => {
    const next = (i + journeySteps.length) % journeySteps.length;
    setIndex(next);
    setPlaying(false);
    setUserStopped(true);
    track("journey_step_viewed", { step: journeySteps[next].id });
    if (focus) tabRefs.current[next]?.focus();
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    const map: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };
    if (e.key in map) { e.preventDefault(); go(index + map[e.key], true); }
    if (e.key === "Home") { e.preventDefault(); go(0, true); }
    if (e.key === "End") { e.preventDefault(); go(journeySteps.length - 1, true); }
  };

  return (
    <div ref={rootRef} className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-mist"><span className="font-semibold text-cloud">Step {index + 1}</span> of {journeySteps.length}</p>
          <button type="button" onClick={() => { if (playing) { setPlaying(false); setUserStopped(true); } else { setUserStopped(false); setPlaying(true); } }}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-silver hover:border-white/25 hover:text-cloud"
            aria-label={playing ? "Pause product tour" : "Play product tour"}>
            <Icon name={playing ? "pause" : "play"} className="h-4 w-4" /> {playing ? "Pause" : "Play tour"}
          </button>
        </div>
        <div className="mb-4 h-1 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden="true">
          <div className="h-full rounded-full bg-gradient-to-r from-signal to-teal transition-[width] duration-500 ease-brand" style={{ width: `${((index + 1) / journeySteps.length) * 100}%` }} />
        </div>
        {/* Mobile: compact step chips */}
        <div className="flex items-center gap-2 lg:hidden">
          <button type="button" onClick={() => go(index - 1)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-silver" aria-label="Previous step"><Icon name="arrowLeft" className="h-4 w-4 rtl:-scale-x-100" /></button>
          <div className="min-w-0 flex-1 text-center">
            <p className="truncate text-sm font-semibold text-cloud">{step.title}</p>
            <p className="text-xs text-teal">{mod?.name}</p>
          </div>
          <button type="button" onClick={() => go(index + 1)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-silver" aria-label="Next step"><Icon name="arrowRight" className="h-4 w-4 rtl:-scale-x-100" /></button>
        </div>
        {/* Desktop: vertical tab list */}
        <div role="tablist" aria-orientation="vertical" aria-label="Product journey steps" onKeyDown={onKey} className="hidden lg:block">
          {journeySteps.map((s, i) => (
            <button key={s.id} ref={(el) => { tabRefs.current[i] = el; }} role="tab" id={`journey-tab-${s.id}`} aria-selected={i === index} aria-controls="journey-panel" tabIndex={i === index ? 0 : -1}
              onClick={() => go(i)}
              className={cn("group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-start transition-colors", i === index ? "bg-white/[0.05]" : "hover:bg-white/[0.03]")}>
              <span className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-semibold transition-colors",
                i === index ? "bg-teal text-midnight" : i < index ? "bg-teal/20 text-teal-soft" : "bg-white/[0.06] text-mist")}>{i + 1}</span>
              <span>
                <span className={cn("block text-[0.9375rem] font-medium", i === index ? "text-cloud" : "text-silver group-hover:text-cloud")}>{s.title}</span>
                {i === index && <span className="mt-1 block text-sm leading-relaxed text-mist">{s.body}</span>}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div id="journey-panel" role="tabpanel" aria-labelledby={`journey-tab-${step.id}`} aria-live="polite" className="lg:pt-12">
        <p className="mb-3 text-sm text-mist lg:hidden">{step.body}</p>
        <div key={step.id} className="animate-fade-up [animation-duration:450ms]">
          <AppFrame activeModule={step.module} title={mod?.label.toLowerCase() ?? "home"}>
            <View />
          </AppFrame>
        </div>
      </div>
    </div>
  );
}
