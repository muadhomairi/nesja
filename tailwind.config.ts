import type { Config } from "tailwindcss";

/**
 * Tailwind theme maps directly onto the CSS-variable design tokens declared in
 * src/styles/tokens.css. Change brand values there, not here.
 */
const token = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: { DEFAULT: "1.25rem", md: "2rem", xl: "2.5rem" }, screens: { "2xl": "1280px" } },
    extend: {
      colors: {
        midnight: { DEFAULT: token("midnight"), 900: token("midnight-900"), 800: token("midnight-800"), 700: token("midnight-700"), 600: token("midnight-600") },
        teal: { DEFAULT: token("teal"), soft: token("teal-soft") },
        signal: { DEFAULT: token("signal"), soft: token("signal-soft") },
        cloud: token("cloud"),
        graphite: token("graphite"),
        silver: token("silver"),
        mist: token("mist"),
      },
      fontFamily: { sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"] },
      fontSize: {
        "display-xl": ["clamp(2.6rem, 6vw, 4.75rem)", { lineHeight: "1.02", letterSpacing: "-0.035em", fontWeight: "600" }],
        "display-lg": ["clamp(2.1rem, 4.4vw, 3.5rem)", { lineHeight: "1.06", letterSpacing: "-0.03em", fontWeight: "600" }],
        "display-md": ["clamp(1.7rem, 3vw, 2.4rem)", { lineHeight: "1.12", letterSpacing: "-0.025em", fontWeight: "600" }],
      },
      borderRadius: { xl: "0.875rem", "2xl": "1.25rem", "3xl": "1.75rem" },
      boxShadow: {
        panel: "0 1px 0 0 rgb(255 255 255 / 0.04) inset, 0 24px 60px -24px rgb(0 0 0 / 0.6)",
        glow: "0 0 0 1px rgb(var(--teal) / 0.35), 0 10px 40px -10px rgb(var(--teal) / 0.45)",
      },
      transitionTimingFunction: { brand: "cubic-bezier(0.22, 1, 0.36, 1)" },
      keyframes: {
        "fade-up": { from: { opacity: "0", transform: "translateY(12px)" }, to: { opacity: "1", transform: "none" } },
        flow: { to: { strokeDashoffset: "-200" } },
        pulseSoft: { "0%,100%": { opacity: "0.55" }, "50%": { opacity: "1" } },
      },
      animation: {
        "fade-up": "fade-up 0.7s var(--ease-brand) both",
        flow: "flow 6s linear infinite",
        "pulse-soft": "pulseSoft 3.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
