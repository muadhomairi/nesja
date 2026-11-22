/** NESJA mark (same geometry as www.nesja.ai), drawn with design-system brand colours. */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="#222223" />
      <path d="M7 9.5c6 0 9 6.5 17 6.5" stroke="#97999a" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M7 16h17" stroke="#57c2e9" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 22.5c6 0 9-6.5 17-6.5" stroke="#4b6bff" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="24.5" cy="16" r="2.3" fill="#57c2e9" />
    </svg>
  );
}
export function Wordmark({ product }: { product?: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <LogoMark />
      <span className="font-display text-[1rem] font-bold tracking-[0.08em]">NESJA<span className="text-brand-600 dark:text-brand-400">.OS</span></span>
      {product && <span className="rounded-md bg-surface-3 px-1.5 py-0.5 text-[11px] font-semibold text-muted">{product}</span>}
    </span>
  );
}
