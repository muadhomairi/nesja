/**
 * Hero visual: separate commercial streams converge into NESJA.OS and emerge
 * as one stream — Growth. Pure SVG + CSS (no JS). Motion stops under
 * prefers-reduced-motion (see globals.css).
 */
import { hero } from "@/content/home";

const W = 640, H = 520, CX = 392, CY = 260, PILL_W = 148, OUT_X = 548;

export function HeroVisual() {
  const n = hero.streams.length;
  const gap = (H - 60) / (n - 1);
  return (
    <figure className="relative" aria-label="Commercial streams converge into NESJA.OS and emerge as growth">
      {/* Desktop / tablet: horizontal convergence */}
      <svg viewBox={`0 0 ${W} ${H}`} className="hidden h-auto w-full sm:block" role="img" aria-hidden="true">
        <Defs />
        {hero.streams.map((label, i) => {
          const y = 30 + i * gap;
          const d = `M ${PILL_W + 6} ${y} C ${PILL_W + 110} ${y}, ${CX - 140} ${CY + (y - CY) * 0.18}, ${CX - 62} ${CY + (y - CY) * 0.06}`;
          const color = i % 2 ? "var(--signal)" : "var(--teal)";
          return (
            <g key={label}>
              <path d={d} stroke={`rgb(${color} / 0.22)`} strokeWidth="1.25" fill="none" />
              <path d={d} stroke={`rgb(${color} / 0.9)`} strokeWidth="1.5" fill="none" className="flow-dash" style={{ animationDelay: `${-i * 0.7}s` }} />
              <circle r="2.6" fill={`rgb(${color})`} className="motion-path">
                <animateMotion dur={`${4.8 + (i % 3) * 0.8}s`} repeatCount="indefinite" path={d} begin={`${-i * 0.6}s`} />
              </circle>
              <g transform={`translate(0 ${y - 15})`}>
                <rect width={PILL_W} height="30" rx="15" fill="rgb(var(--midnight-800))" stroke="rgb(var(--silver) / 0.14)" />
                <circle cx="16" cy="15" r="3" fill={`rgb(${color})`} />
                <text x="28" y="19.5" fill="rgb(var(--silver))" fontSize="12.5" fontWeight="500" fontFamily="var(--font-sans)">{label}</text>
              </g>
            </g>
          );
        })}
        <Core x={CX} y={CY} />
        <path d={`M ${CX + 62} ${CY} L ${OUT_X - 8} ${CY}`} stroke="url(#out)" strokeWidth="3" strokeLinecap="round" />
        <path d={`M ${CX + 62} ${CY} L ${OUT_X - 8} ${CY}`} stroke="rgb(var(--cloud) / 0.9)" strokeWidth="1.5" className="flow-dash" fill="none" />
        <Growth x={OUT_X} y={CY} />
      </svg>

      {/* Mobile: vertical convergence */}
      <svg viewBox="0 0 360 470" className="h-auto w-full sm:hidden" role="img" aria-hidden="true">
        <Defs />
        {hero.streams.map((label, i) => {
          const col = i % 2, row = Math.floor(i / 2);
          const x = col ? 268 : 92, y = 18 + row * 40;
          const d = `M ${x} ${y + 14} C ${x} ${y + 120 - row * 20}, 180 ${210 - row * 10}, 180 262`;
          const color = col ? "var(--signal)" : "var(--teal)";
          return (
            <g key={label}>
              <path d={d} stroke={`rgb(${color} / 0.25)`} strokeWidth="1.2" fill="none" />
              <path d={d} stroke={`rgb(${color} / 0.85)`} strokeWidth="1.4" fill="none" className="flow-dash" style={{ animationDelay: `${-i * 0.7}s` }} />
              <g transform={`translate(${x - 78} ${y - 13})`}>
                <rect width="156" height="26" rx="13" fill="rgb(var(--midnight-800))" stroke="rgb(var(--silver) / 0.14)" />
                <text x="78" y="17.5" textAnchor="middle" fill="rgb(var(--silver))" fontSize="12" fontWeight="500" fontFamily="var(--font-sans)">{label}</text>
              </g>
            </g>
          );
        })}
        <Core x={180} y={318} small />
        <path d="M 180 368 L 180 410" stroke="url(#outv)" strokeWidth="3" strokeLinecap="round" />
        <g transform="translate(120 412)">
          <rect width="120" height="34" rx="17" fill="rgb(var(--teal) / 0.12)" stroke="rgb(var(--teal) / 0.6)" />
          <text x="60" y="22" textAnchor="middle" fill="rgb(var(--teal-soft))" fontSize="13.5" fontWeight="700" fontFamily="var(--font-sans)">{hero.outcome} ↗</text>
        </g>
      </svg>
      <figcaption className="sr-only">{hero.streams.join(", ")} converge into NESJA.OS and emerge as {hero.outcome}.</figcaption>
    </figure>
  );
}

function Defs() {
  return (
    <defs>
      <radialGradient id="core-glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="rgb(var(--teal))" stopOpacity="0.35" />
        <stop offset="60%" stopColor="rgb(var(--signal))" stopOpacity="0.08" />
        <stop offset="100%" stopColor="rgb(var(--signal))" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="core-fill" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="rgb(var(--midnight-700))" />
        <stop offset="100%" stopColor="rgb(var(--midnight-800))" />
      </linearGradient>
      <linearGradient id="out" x1="0" x2="1">
        <stop offset="0%" stopColor="rgb(var(--signal))" />
        <stop offset="100%" stopColor="rgb(var(--teal))" />
      </linearGradient>
      <linearGradient id="outv" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="rgb(var(--signal))" />
        <stop offset="100%" stopColor="rgb(var(--teal))" />
      </linearGradient>
    </defs>
  );
}

function Core({ x, y, small }: { x: number; y: number; small?: boolean }) {
  const s = small ? 0.82 : 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r="120" fill="url(#core-glow)" />
      <circle r="92" fill="none" stroke="rgb(var(--silver) / 0.08)" />
      <circle r="76" fill="none" stroke="rgb(var(--teal) / 0.25)" strokeDasharray="2 6" className="animate-[spin_40s_linear_infinite]" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
      <rect x="-62" y="-42" width="124" height="84" rx="22" fill="url(#core-fill)" stroke="rgb(var(--teal) / 0.55)" />
      <text y="-4" textAnchor="middle" fill="rgb(var(--cloud))" fontSize="17" fontWeight="700" letterSpacing="1.5" fontFamily="var(--font-sans)">NESJA<tspan fill="rgb(var(--teal))">.OS</tspan></text>
      <text y="17" textAnchor="middle" fill="rgb(var(--mist))" fontSize="9.5" letterSpacing="1.2" fontFamily="var(--font-sans)">COMMERCIAL OS</text>
    </g>
  );
}

function Growth({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y - 46})`}>
      <rect width="92" height="92" rx="22" fill="rgb(var(--teal) / 0.1)" stroke="rgb(var(--teal) / 0.55)" />
      <path d="M 18 66 L 36 50 L 50 58 L 74 30" stroke="rgb(var(--teal))" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M 64 30 L 74 30 L 74 40" stroke="rgb(var(--teal))" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x="46" y="84" textAnchor="middle" fill="rgb(var(--teal-soft))" fontSize="12" fontWeight="700" fontFamily="var(--font-sans)">{hero.outcome}</text>
    </g>
  );
}
