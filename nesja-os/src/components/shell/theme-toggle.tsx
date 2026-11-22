"use client";
import { Moon, Sun } from "lucide-react";
export function ThemeToggle() {
  return (
    <button type="button" aria-label="Switch light or dark mode" className="rounded-lg p-2 text-muted hover:bg-hover"
      onClick={() => { const dark = !document.documentElement.classList.contains("dark"); document.documentElement.classList.toggle("dark", dark);
        try { localStorage.setItem("nesja-theme", dark ? "dark" : "light"); } catch { /* storage unavailable */ } }}>
      <Sun className="hidden h-4 w-4 dark:block" /><Moon className="h-4 w-4 dark:hidden" />
    </button>
  );
}
export const themeScript = `try{var t=localStorage.getItem('nesja-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.classList.add('dark')}catch(e){}`;
