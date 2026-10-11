"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CONSENT_EVENT, OPEN_CONSENT_EVENT, openConsentPreferences, readConsent, writeConsent, type ConsentState } from "@/lib/consent";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/i18n";
import { cn } from "@/lib/cn";

const t = getDictionary().consent;

/** Consent banner + preferences. No non-essential tracking runs before a choice. */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = readConsent();
    setAnalytics(c.analytics);
    setMarketing(c.marketing);
    if (!c.decided) setVisible(true);
    const reopen = () => { const cur = readConsent(); setAnalytics(cur.analytics); setMarketing(cur.marketing); setVisible(true); setPrefsOpen(true); };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  useEffect(() => { if (prefsOpen) panelRef.current?.querySelector<HTMLElement>("input,button")?.focus(); }, [prefsOpen]);

  const save = (choice: { analytics: boolean; marketing: boolean }) => { writeConsent(choice); setVisible(false); setPrefsOpen(false); };

  if (!visible) return null;
  return (
    <div role="dialog" aria-modal="false" aria-labelledby="consent-title" aria-describedby="consent-body" data-print-hidden
      className="fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:end-5 sm:bottom-5 sm:w-[420px]">
      <div ref={panelRef} className="surface animate-fade-up bg-midnight-800/95 p-5 backdrop-blur-xl">
        <h2 id="consent-title" className="text-base font-semibold text-cloud">{t.title}</h2>
        <p id="consent-body" className="mt-2 text-sm leading-relaxed text-mist">
          {t.body} <Link href="/cookies" className="text-teal underline underline-offset-2">Cookie Policy</Link>
        </p>
        {prefsOpen && (
          <fieldset className="mt-4 space-y-3 border-t border-white/[0.06] pt-4">
            <legend className="sr-only">Cookie categories</legend>
            <Toggle id="c-necessary" label="Necessary" description="Required for the site to work, including your consent choice." checked disabled />
            <Toggle id="c-analytics" label="Analytics" description="Helps us understand which pages are useful." checked={analytics} onChange={setAnalytics} />
            <Toggle id="c-marketing" label="Marketing" description="Measures campaigns and remembers how you found us." checked={marketing} onChange={setMarketing} />
          </fieldset>
        )}
        <div className="mt-5 flex flex-wrap gap-2">
          {prefsOpen ? (
            <Button size="sm" onClick={() => save({ analytics, marketing })}>{t.save}</Button>
          ) : (
            <>
              <Button size="sm" variant="secondary" onClick={() => save({ analytics: true, marketing: true })}>{t.acceptAll}</Button>
              <Button size="sm" variant="secondary" onClick={() => save({ analytics: false, marketing: false })}>{t.rejectAll}</Button>
              <Button size="sm" variant="ghost" onClick={() => setPrefsOpen(true)}>{t.customise}</Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Toggle({ id, label, description, checked, disabled, onChange }: { id: string; label: string; description: string; checked: boolean; disabled?: boolean; onChange?: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <label htmlFor={id} className="text-sm">
        <span className="font-medium text-cloud">{label}</span>
        <span className="mt-0.5 block text-mist">{description}</span>
      </label>
      <button id={id} type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange?.(!checked)}
        className={cn("relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-60", checked ? "bg-teal" : "bg-white/15")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-cloud transition-all", checked ? "start-[1.375rem]" : "start-0.5")} />
        <span className="sr-only">{label}</span>
      </button>
    </div>
  );
}

export function CookieSettingsButton() {
  return <button type="button" onClick={openConsentPreferences} className="hover:text-cloud">Cookie Settings</button>;
}

export type { ConsentState };
export { CONSENT_EVENT };
