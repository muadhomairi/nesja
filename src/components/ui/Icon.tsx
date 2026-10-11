/** Restrained line-icon set (24px grid, 1.5 stroke). Decorative by default. */
import type { SVGProps } from "react";

const paths: Record<string, React.ReactNode> = {
  pipeline: <><path d="M4 6h10M4 12h14M4 18h7" /><circle cx="18" cy="6" r="1.6" /><circle cx="21" cy="12" r="1.6" /><circle cx="14" cy="18" r="1.6" /></>,
  accounts: <><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="12" cy="10" r="2.6" /><path d="M7.5 17c1-2.2 2.6-3.2 4.5-3.2s3.5 1 4.5 3.2" /></>,
  quote: <><path d="M7 3.5h7l4 4V20a.5.5 0 0 1-.5.5h-10.5a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5Z" /><path d="M14 3.5V8h4M9 12h6M9 15h6M9 18h3" /></>,
  contracts: <><path d="M6 3.5h12v17H6z" /><path d="M9 8h6M9 11h6" /><path d="M9 16.5c1-1.5 1.8-1.5 2.4 0s1.4 1.5 2.6-.4" /></>,
  engage: <><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5z" /><path d="M8.5 9.5h7M8.5 12.5h4" /></>,
  success: <><path d="M12 20.5s-7.5-4.3-7.5-10A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.9c0 5.7-7.5 10-7.5 10Z" /><path d="m9.2 12 1.9 1.9 3.8-3.8" /></>,
  intelligence: <><path d="M4 20h16" /><path d="M7 16v-4M11 16V8M15 16v-6M19 16V5" /></>,
  ai: <><path d="M12 3.5v3M12 17.5v3M3.5 12h3M17.5 12h3" /><circle cx="12" cy="12" r="4" /><path d="m6 6 1.8 1.8M16.2 16.2 18 18M18 6l-1.8 1.8M7.8 16.2 6 18" /></>,
  marketing: <><path d="M4 10v4h3l6 4V6L7 10z" /><path d="M16.5 9a4 4 0 0 1 0 6" /></>,
  core: <><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" strokeDasharray="2 3" /></>,
  arrowRight: <path d="M5 12h14m-5-5 5 5-5 5" />,
  arrowLeft: <path d="M19 12H5m5-5-5 5 5 5" />,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  chevronRight: <path d="m9 6 6 6-6 6" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  lock: <><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>,
  shield: <><path d="M12 3.5 5 6.5v5.2c0 4.2 3 7.4 7 8.8 4-1.4 7-4.6 7-8.8V6.5z" /><path d="m9.2 12 1.9 1.9 3.8-3.8" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.4 2.6 3.5 5.4 3.5 8.5s-1.1 5.9-3.5 8.5c-2.4-2.6-3.5-5.4-3.5-8.5s1.1-5.9 3.5-8.5Z" /></>,
  calendar: <><rect x="4" y="5.5" width="16" height="15" rx="2" /><path d="M4 10h16M8 3.5v4M16 3.5v4" /></>,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  video: <><rect x="3.5" y="6.5" width="12" height="11" rx="2" /><path d="m15.5 10.5 5-3v9l-5-3" /></>,
  mail: <><rect x="3.5" y="5.5" width="17" height="13" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  sparkle: <path d="M12 3.5c.6 4.3 2.2 5.9 6.5 6.5-4.3.6-5.9 2.2-6.5 6.5-.6-4.3-2.2-5.9-6.5-6.5 4.3-.6 5.9-2.2 6.5-6.5ZM18.5 15.5c.3 1.8.9 2.4 2.5 2.7-1.6.3-2.2.9-2.5 2.6-.3-1.7-.9-2.3-2.5-2.6 1.6-.3 2.2-.9 2.5-2.7Z" />,
  alert: <><path d="M12 4 3 19.5h18z" /><path d="M12 10v4M12 16.8v.2" /></>,
  info: <><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8v.2" /></>,
  play: <><circle cx="12" cy="12" r="8.5" /><path d="m10 8.8 5 3.2-5 3.2z" /></>,
  pause: <><circle cx="12" cy="12" r="8.5" /><path d="M10 9v6M14 9v6" /></>,
  download: <path d="M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 19.5h14" />,
  building: <><path d="M5 20.5V5.5l7-2v17M12 8.5l7 2v10M3.5 20.5h17" /><path d="M8 9h1M8 12h1M8 15h1M15 13h1M15 16h1" /></>,
  link: <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />,
  users: <><circle cx="9" cy="9" r="3" /><path d="M3.5 19c.9-3 3-4.5 5.5-4.5s4.6 1.5 5.5 4.5" /><path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 14.7c1.4.6 2.4 2 3 4.3" /></>,
  external: <path d="M14 4.5h5.5V10M19.5 4.5 11 13M17 13.5v5a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5" />,
};

export type IconKey = keyof typeof paths;

export function Icon({ name, title, className = "h-5 w-5", ...rest }: { name: IconKey | string; title?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden={title ? undefined : true} role={title ? "img" : undefined} focusable="false" {...rest}>
      {title ? <title>{title}</title> : null}
      {paths[name] ?? paths.core}
    </svg>
  );
}
