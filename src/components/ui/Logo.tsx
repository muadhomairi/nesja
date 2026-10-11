import Link from "next/link";

/** Mark: separate threads converging into one — the weave, abstracted. */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false">
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="rgb(var(--midnight-800))" stroke="rgb(var(--silver) / 0.16)" />
      <path d="M7 9.5c6 0 9 6.5 17 6.5" stroke="rgb(var(--silver))" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M7 16h17" stroke="rgb(var(--teal))" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 22.5c6 0 9-6.5 17-6.5" stroke="rgb(var(--signal))" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="24.5" cy="16" r="2.3" fill="rgb(var(--teal))" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`group inline-flex items-center gap-2.5 rounded-lg ${className}`} aria-label="NESJA.OS home">
      <LogoMark />
      <span className="text-[1.05rem] font-bold tracking-[0.08em] text-cloud">
        NESJA<span className="text-teal">.OS</span>
      </span>
    </Link>
  );
}
