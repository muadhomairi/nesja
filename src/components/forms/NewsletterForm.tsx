"use client";
import { useState } from "react";
import { postJson } from "@/lib/api-client";
import { getAttribution, submissionContext } from "@/lib/attribution";
import { emailField } from "@/lib/validation";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { Honeypot } from "@/components/ui/Field";
import { cn } from "@/lib/cn";

export function NewsletterForm({ location }: { location: string }) {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const id = `nl-${location}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = emailField.safeParse(email);
    if (!check.success) { setState("error"); setMessage(check.error.issues[0].message); return; }
    setState("loading");
    const res = await postJson("/api/subscribe", { email, location, attribution: getAttribution(), submission: submissionContext(`newsletter:${location}`), website: hp });
    if (res.ok) { setState("done"); track("newsletter_subscribed", { location }); }
    else { setState("error"); setMessage(res.error); }
  };

  if (state === "done") return <p role="status" className="text-sm text-teal-soft">Thank you. You&apos;re subscribed to NESJA Perspectives.</p>;
  return (
    <form onSubmit={submit} noValidate className="relative">
      <Honeypot value={hp} onChange={setHp} />
      <div className="flex gap-2">
        <label htmlFor={id} className="sr-only">Work email</label>
        <input id={id} type="email" autoComplete="email" placeholder="Work email" value={email} onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
          aria-invalid={state === "error" || undefined} aria-describedby={state === "error" ? `${id}-err` : undefined}
          className={cn("h-11 min-w-0 flex-1 rounded-full border bg-midnight/60 px-4 text-sm text-cloud placeholder:text-mist/70 focus:outline-none focus:ring-2 focus:ring-teal/50", state === "error" ? "border-rose-400/70" : "border-white/[0.12]")} />
        <Button type="submit" variant="secondary" size="sm" className="h-11 whitespace-nowrap" loading={state === "loading"}>Subscribe</Button>
      </div>
      {state === "error" && <p id={`${id}-err`} role="alert" className="mt-2 text-sm text-rose-300">{message}</p>}
    </form>
  );
}
