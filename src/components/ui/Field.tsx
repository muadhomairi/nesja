/** Accessible form fields: visible labels, described errors, hint text. */
import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "./Icon";

const control = "block w-full rounded-xl border bg-midnight-900/60 px-4 text-[0.9375rem] text-cloud placeholder:text-mist/60 transition-colors duration-200 focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-teal/50";
const tone = (err?: string) => (err ? "border-rose-400/70 focus:border-rose-300" : "border-white/[0.12] hover:border-white/25 focus:border-teal/70");

interface Base { label: string; name: string; error?: string; hint?: ReactNode; optional?: boolean; className?: string }

function Wrapper({ label, name, error, hint, optional, className, children }: Base & { children: ReactNode }) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={name} className="flex items-baseline justify-between text-sm font-medium text-silver">
        <span>{label}</span>
        {optional && <span className="text-xs font-normal text-mist">Optional</span>}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="flex items-center gap-1.5 text-sm text-rose-300" role="alert">
          <Icon name="alert" className="h-4 w-4 shrink-0" /> {error}
        </p>
      ) : hint ? (
        <p id={`${name}-hint`} className="text-sm text-mist">{hint}</p>
      ) : null}
    </div>
  );
}

const describedBy = (name: string, error?: string, hint?: ReactNode) => (error ? `${name}-error` : hint ? `${name}-hint` : undefined);

export const TextField = forwardRef<HTMLInputElement, Base & InputHTMLAttributes<HTMLInputElement>>(function TextField({ label, name, error, hint, optional, className, ...rest }, ref) {
  return (
    <Wrapper {...{ label, name, error, hint, optional, className }}>
      <input ref={ref} id={name} name={name} className={cn(control, tone(error), "h-12")} aria-invalid={!!error || undefined} aria-describedby={describedBy(name, error, hint)} required={!optional} {...rest} />
    </Wrapper>
  );
});

export const TextArea = forwardRef<HTMLTextAreaElement, Base & TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea({ label, name, error, hint, optional, className, ...rest }, ref) {
  return (
    <Wrapper {...{ label, name, error, hint, optional, className }}>
      <textarea ref={ref} id={name} name={name} rows={5} className={cn(control, tone(error), "min-h-[8rem] py-3")} aria-invalid={!!error || undefined} aria-describedby={describedBy(name, error, hint)} required={!optional} {...rest} />
    </Wrapper>
  );
});

export const SelectField = forwardRef<HTMLSelectElement, Base & SelectHTMLAttributes<HTMLSelectElement> & { options: readonly string[]; optionLabels?: Record<string, string>; placeholder?: string }>(
  function SelectField({ label, name, error, hint, optional, className, options, optionLabels, placeholder = "Select…", ...rest }, ref) {
    return (
      <Wrapper {...{ label, name, error, hint, optional, className }}>
        <div className="relative">
          <select ref={ref} id={name} name={name} className={cn(control, tone(error), "h-12 appearance-none pe-10")} aria-invalid={!!error || undefined} aria-describedby={describedBy(name, error, hint)} required={!optional} {...rest}>
            <option value="">{placeholder}</option>
            {options.map((o) => <option key={o} value={o}>{optionLabels?.[o] ?? o}</option>)}
          </select>
          <Icon name="chevronDown" className="pointer-events-none absolute end-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
        </div>
      </Wrapper>
    );
  },
);

/** Hidden honeypot field for bots. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="website">Website</label>
      <input id="website" name="website" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function FormAlert({ tone = "error", children }: { tone?: "error" | "success" | "info"; children: ReactNode }) {
  const styles = { error: "border-rose-400/30 bg-rose-400/10 text-rose-200", success: "border-teal/30 bg-teal/10 text-teal-soft", info: "border-signal/30 bg-signal/10 text-signal-soft" };
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex items-start gap-3 rounded-xl border px-4 py-3 text-sm", styles[tone])}>
      <Icon name={tone === "error" ? "alert" : tone === "success" ? "check" : "info"} className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
