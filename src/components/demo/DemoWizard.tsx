"use client";
/**
 * Demo booking flow: email → name & company → team size → interest → time.
 * Availability is prefetched so the final step is instant. Uses the
 * scheduling adapter behind /api/scheduling/* (mock in development).
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { demoContactSchema, demoInterests, emailField, isFreeEmail, teamSizes, fieldErrors } from "@/lib/validation";
import { postJson } from "@/lib/api-client";
import { getAttribution, submissionContext } from "@/lib/attribution";
import { track } from "@/lib/analytics";
import { buildIcs } from "@/lib/ics";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { TextField, FormAlert, Honeypot } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

type Slot = { id: string; start: string; end: string };
type Booking = { id: string; start: string; end: string; timezone: string; meetingMethod: string; joinUrl?: string; calendarStatus: "invite_sent" | "pending" | "not_sent"; provider: string };
type Interest = (typeof demoInterests)[number];
type TeamSize = (typeof teamSizes)[number];

const STEPS = ["Work email", "About you", "Team size", "Interest", "Time"] as const;
const moduleToInterest: Record<string, Interest> = { pipeline: "Pipeline", accounts: "Pipeline", quote: "Quoting", contracts: "Contracts", success: "Customer Success", engage: "Communication", intelligence: "Commercial Intelligence", ai: "AI" };

const dayKey = (iso: string, tz: string) => new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
const fmt = (iso: string, tz: string, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: tz, ...o }).format(new Date(iso));

export function DemoWizard() {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<null | { booking: Booking; requested: boolean; emailSent: boolean }>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [teamSize, setTeamSize] = useState<TeamSize | "">("");
  const [interest, setInterest] = useState<Interest | "">("");
  const [context, setContext] = useState("");
  const [hp, setHp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tz, setTz] = useState("UTC");
  const [slots, setSlots] = useState<{ status: "idle" | "loading" | "ready" | "error"; items: Slot[]; error?: string; provider?: string }>({ status: "idle", items: [] });
  const [day, setDay] = useState("");
  const [slot, setSlot] = useState<Slot | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const started = useRef(false);

  // Detect timezone + read context from the URL.
  useEffect(() => {
    setTz(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    const q = new URLSearchParams(window.location.search);
    const mod = q.get("module");
    const int = q.get("interest");
    if (mod && moduleToInterest[mod]) setInterest(moduleToInterest[mod]);
    else if (int) { const m = demoInterests.find((i) => i.toLowerCase() === int.toLowerCase()); if (m) setInterest(m); }
    const parts = [q.get("edition") && `edition ${q.get("edition")}`, q.get("term") && `term ${q.get("term")}`, q.get("seats") && `${q.get("seats")} users`].filter(Boolean);
    if (parts.length) setContext(`From pricing: ${parts.join(", ")}`);
  }, []);

  const loadSlots = useCallback(async (zone: string) => {
    setSlots((s) => ({ ...s, status: "loading" }));
    try {
      const res = await fetch(`/api/scheduling/availability?days=14&timezone=${encodeURIComponent(zone)}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setSlots({ status: "ready", items: data.slots, provider: data.provider });
    } catch (e) {
      setSlots({ status: "error", items: [], error: e instanceof Error && e.message ? e.message : "We couldn't load availability." });
    }
  }, []);

  // Prefetch availability once the timezone is known.
  useEffect(() => { if (tz) loadSlots(tz); }, [tz, loadSlots]);

  const days = useMemo(() => {
    const map = new Map<string, Slot[]>();
    slots.items.forEach((s) => { const k = dayKey(s.start, tz); map.set(k, [...(map.get(k) || []), s]); });
    return [...map.entries()];
  }, [slots.items, tz]);

  useEffect(() => { if (days.length && !days.some(([k]) => k === day)) setDay(days[0][0]); }, [days, day]);
  useEffect(() => { headingRef.current?.focus(); }, [step, done]);

  const advance = (n: number) => { track("demo_step_completed", { step: step + 1, name: STEPS[step] }); setErrors({}); setFormError(""); setStep(n); };

  const next = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      const r = emailField.safeParse(email);
      if (!r.success) return setErrors({ email: r.error.issues[0].message });
      if (!started.current) { started.current = true; track("demo_started", { source: context ? "pricing" : undefined }); }
      return advance(1);
    }
    if (step === 1) {
      const r = demoContactSchema.safeParse({ email, name, company });
      if (!r.success) return setErrors(fieldErrors(r.error));
      return advance(2);
    }
    if (step === 2) return teamSize ? advance(3) : setErrors({ teamSize: "Choose your team size." });
    if (step === 3) return interest ? advance(4) : setErrors({ interest: "Choose what you'd like to see." });
    if (step === 4) return book();
  };

  const book = async () => {
    if (!slot) return setErrors({ slot: "Choose a time that works for you." });
    setSubmitting(true); setFormError("");
    const res = await postJson<{ booking: Booking; requested: boolean; emailSent: boolean }>("/api/scheduling/book", {
      email, name, company, teamSize, interest, slotId: slot.id, start: slot.start, end: slot.end, timezone: tz, context: context || undefined, attribution: getAttribution(),
      submission: submissionContext(context ? "book-demo:pricing" : "book-demo"), website: hp,
    });
    setSubmitting(false);
    if (res.ok) {
      setDone({ booking: res.booking, requested: res.requested, emailSent: res.emailSent });
      track("demo_completed", { teamSize, interest, provider: res.booking.provider });
      return;
    }
    if (res.code === "slot_unavailable") { setSlot(null); loadSlots(tz); }
    if (res.fieldErrors) setErrors(res.fieldErrors);
    setFormError(res.error);
  };

  if (done) return <Confirmation {...done} name={name} email={email} interest={interest} headingRef={headingRef} />;

  // Without a connected calendar, the visitor proposes a time and the team confirms it.
  const requestMode = slots.provider === "mock";

  const timezones: string[] = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : [tz];

  return (
    <div className="surface overflow-hidden bg-midnight-800/80">
      <div className="border-b border-white/[0.06] px-6 pb-5 pt-6 md:px-8">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-cloud">Step {step + 1} of {STEPS.length}</span>
          <span className="text-mist">{STEPS[step]}</span>
        </div>
        <div className="mt-3 grid grid-cols-5 gap-1.5" aria-hidden="true">
          {STEPS.map((s, i) => <span key={s} className={cn("h-1 rounded-full transition-colors duration-500", i <= step ? "bg-teal" : "bg-white/10")} />)}
        </div>
      </div>

      <form onSubmit={next} noValidate className="relative px-6 py-7 md:px-8 md:py-8">
        <Honeypot value={hp} onChange={setHp} />
        {step === 0 && (
          <StepShell title="Let's find a time." sub="Start with your work email. It takes under a minute." headingRef={headingRef}>
            <TextField label="Work email" name="email" type="email" autoComplete="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email}
              hint={email.includes("@") && isFreeEmail(email) ? "Using a personal address is fine. A work email helps us tailor the demo." : undefined} autoFocus />
          </StepShell>
        )}
        {step === 1 && (
          <StepShell title="Who are we meeting?" sub="So we can prepare a relevant walkthrough." headingRef={headingRef}>
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Full name" name="name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
              <TextField label="Company" name="company" autoComplete="organization" value={company} onChange={(e) => setCompany(e.target.value)} error={errors.company} />
            </div>
          </StepShell>
        )}
        {step === 2 && (
          <StepShell title="How large is your commercial team?" sub="Sales, marketing, commercial operations and customer success combined." headingRef={headingRef}>
            <ChoiceGrid name="teamSize" options={teamSizes} value={teamSize} onChange={(v) => setTeamSize(v as TeamSize)} error={errors.teamSize} cols="grid-cols-2 sm:grid-cols-3" />
          </StepShell>
        )}
        {step === 3 && (
          <StepShell title="What would you most like to see?" sub="We'll lead with this, and you can explore anything else live." headingRef={headingRef}>
            <ChoiceGrid name="interest" options={demoInterests} value={interest} onChange={(v) => setInterest(v as Interest)} error={errors.interest} cols="grid-cols-2" />
          </StepShell>
        )}
        {step === 4 && (
          <StepShell title={requestMode ? "Choose a preferred time." : "Choose a time."} sub={requestMode ? "30 minutes with a NESJA specialist. We'll confirm the time with you by email." : "30 minutes with a NESJA specialist."} headingRef={headingRef}>
            <div className="mb-4">
              <label htmlFor="tz" className="mb-1.5 block text-xs font-medium text-mist">Times shown in</label>
              <select id="tz" value={tz} onChange={(e) => { setTz(e.target.value); setSlot(null); }} className="h-10 w-full rounded-xl border border-white/[0.12] bg-midnight-900/60 px-3 text-sm text-cloud">
                {(timezones.includes(tz) ? timezones : [tz, ...timezones]).map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}</option>)}
              </select>
            </div>
            {slots.status === "loading" && <div className="space-y-3" aria-busy="true" aria-label="Loading availability"><div className="h-16 animate-pulse rounded-xl bg-white/[0.04]" /><div className="h-32 animate-pulse rounded-xl bg-white/[0.04]" /></div>}
            {slots.status === "error" && <FormAlert>{slots.error} <button type="button" onClick={() => loadSlots(tz)} className="font-semibold underline">Try again</button></FormAlert>}
            {slots.status === "ready" && days.length === 0 && <FormAlert tone="info">No times are available in the next two weeks. <Link href="/contact" className="font-semibold underline">Contact us</Link> and we&apos;ll arrange one.</FormAlert>}
            {slots.status === "ready" && days.length > 0 && (
              <>
                <fieldset>
                  <legend className="sr-only">Date</legend>
                  <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
                    {days.map(([k, list]) => (
                      <label key={k} className={cn("flex w-[4.5rem] shrink-0 cursor-pointer flex-col items-center rounded-xl border py-2.5 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal", day === k ? "border-teal/60 bg-teal/10" : "border-white/10 hover:border-white/25")}>
                        <input type="radio" name="day" value={k} checked={day === k} onChange={() => { setDay(k); setSlot(null); }} className="sr-only" />
                        <span className="text-[0.6875rem] uppercase tracking-wider text-mist">{fmt(list[0].start, tz, { weekday: "short" })}</span>
                        <span className="text-lg font-semibold text-cloud">{fmt(list[0].start, tz, { day: "numeric" })}</span>
                        <span className="text-[0.6875rem] text-mist">{fmt(list[0].start, tz, { month: "short" })}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset className="mt-4">
                  <legend className="mb-2 text-sm font-medium text-silver">Available times</legend>
                  <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto pe-1 sm:grid-cols-4">
                    {(days.find(([k]) => k === day)?.[1] ?? []).map((s) => (
                      <label key={s.id} className={cn("cursor-pointer rounded-lg border py-2 text-center text-sm font-medium tabular-nums transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal", slot?.id === s.id ? "border-teal bg-teal text-midnight" : "border-white/10 text-silver hover:border-white/30 hover:text-cloud")}>
                        <input type="radio" name="slot" value={s.id} checked={slot?.id === s.id} onChange={() => { setSlot(s); setErrors({}); }} className="sr-only" />
                        {fmt(s.start, tz, { hour: "2-digit", minute: "2-digit" })}
                      </label>
                    ))}
                  </div>
                </fieldset>
                {errors.slot && <p role="alert" className="mt-3 text-sm text-rose-300">{errors.slot}</p>}
              </>
            )}
          </StepShell>
        )}

        {formError && <div className="mt-5"><FormAlert>{formError}</FormAlert></div>}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 0 ? <Button type="button" variant="ghost" onClick={() => { setErrors({}); setFormError(""); setStep(step - 1); }}><Icon name="arrowLeft" className="h-4 w-4 rtl:-scale-x-100" /> Back</Button> : <span />}
          <Button type="submit" size="lg" loading={submitting} arrow={step < 4}>{step < 4 ? "Continue" : submitting ? "Sending…" : requestMode ? "Request demo" : "Confirm booking"}</Button>
        </div>
        {step === 0 && <p className="mt-6 text-xs leading-relaxed text-mist">By continuing you agree to our <Link href="/privacy" className="underline hover:text-cloud">Privacy Policy</Link>. We use your details to arrange and prepare your demonstration.</p>}
      </form>
    </div>
  );
}

function StepShell({ title, sub, children, headingRef }: { title: string; sub: string; children: React.ReactNode; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  return (
    <div className="animate-fade-up [animation-duration:350ms]">
      <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-cloud outline-none md:text-2xl">{title}</h2>
      <p className="mb-6 mt-1.5 text-sm text-mist">{sub}</p>
      {children}
    </div>
  );
}

function ChoiceGrid({ name, options, value, onChange, error, cols }: { name: string; options: readonly string[]; value: string; onChange: (v: string) => void; error?: string; cols: string }) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="sr-only">{name}</legend>
      <div className={cn("grid gap-2", cols)}>
        {options.map((o) => (
          <label key={o} className={cn("flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-4 py-3.5 text-sm font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-teal", value === o ? "border-teal/60 bg-teal/10 text-cloud" : "border-white/10 text-silver hover:border-white/25 hover:text-cloud")}>
            <input type="radio" name={name} value={o} checked={value === o} onChange={() => onChange(o)} className="sr-only" />
            {o}
            {value === o && <Icon name="check" className="h-4 w-4 text-teal" />}
          </label>
        ))}
      </div>
      {error && <p id={`${name}-error`} role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
    </fieldset>
  );
}

function Confirmation({ booking, requested, emailSent, name, email, interest, headingRef }: { booking: Booking; requested: boolean; emailSent: boolean; name: string; email: string; interest: string; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const tz = booking.timezone;
  const ics = buildIcs({ uid: booking.id, start: booking.start, end: booking.end, title: "NESJA.OS demo", description: `NESJA.OS demo for ${name}.${booking.joinUrl ? ` Join: ${booking.joinUrl}` : ""}`, location: booking.meetingMethod, url: booking.joinUrl });
  const icsHref = `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
  const gStamp = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const gcal = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent("NESJA.OS demo")}&dates=${gStamp(booking.start)}/${gStamp(booking.end)}&details=${encodeURIComponent("Your NESJA.OS demo.")}`;
  const calendarStatus =
    booking.calendarStatus === "invite_sent" ? `Calendar invitation sent to ${email}.`
      : emailSent ? `Confirmation sent to ${email}. Your calendar invitation will follow.`
      : "Add this meeting to your calendar using the buttons below.";
  const first = name.split(" ")[0];

  return (
    <div className="surface overflow-hidden bg-midnight-800/80" role="status">
      <div className="px-6 py-8 md:px-10 md:py-10">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal/15 text-teal"><Icon name="check" className="h-6 w-6" /></span>
        <h2 ref={headingRef} tabIndex={-1} className="mt-6 text-display-md text-cloud outline-none">{requested ? "Your demo request has been received." : "You\u2019re booked."}</h2>
        <p className="mt-2 text-mist">
          {requested
            ? `Thank you, ${first}. A member of the NESJA team will review your request and confirm your demonstration by email at ${email}.`
            : `Thank you, ${first}. We look forward to meeting you.`}
        </p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            ["calendar", requested ? "Preferred date" : "Date", fmt(booking.start, tz, { weekday: "long", day: "numeric", month: "long", year: "numeric" })],
            ["clock", requested ? "Preferred time" : "Time", `${fmt(booking.start, tz, { hour: "2-digit", minute: "2-digit" })} – ${fmt(booking.end, tz, { hour: "2-digit", minute: "2-digit" })}`],
            ["globe", "Timezone", tz.replace(/_/g, " ")],
            ["video", "Meeting method", booking.meetingMethod],
          ].map(([icon, k, v]) => (
            <div key={k} className="rounded-xl border border-white/[0.07] bg-midnight-900/40 p-4">
              <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-mist"><Icon name={icon} className="h-4 w-4 text-teal" />{k}</dt>
              <dd className="mt-1.5 font-semibold text-cloud">{v}</dd>
            </div>
          ))}
        </dl>
        {requested ? (
          <div className="mt-4 rounded-xl border border-white/[0.07] bg-midnight-900/40 p-4">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-mist"><Icon name="mail" className="h-4 w-4 text-teal" />Next step</p>
            <p className="mt-1.5 text-sm text-silver">We&apos;ll confirm this time, or suggest an alternative, and send a calendar invitation. Your demonstration will focus on {interest && interest !== "Everything" ? interest.toLowerCase() : "the full commercial lifecycle"}, your use cases and your deployment requirements.</p>
          </div>
        ) : (
          <>
            <div className="mt-4 rounded-xl border border-white/[0.07] bg-midnight-900/40 p-4">
              <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.12em] text-mist"><Icon name="mail" className="h-4 w-4 text-teal" />Calendar status</p>
              <p className="mt-1.5 text-sm text-silver">{calendarStatus}</p>
              {booking.joinUrl && <a href={booking.joinUrl} className="mt-2 inline-flex text-sm font-semibold text-teal hover:underline" target="_blank" rel="noopener noreferrer">Join link</a>}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={icsHref} download="nesja-demo.ics" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-cloud hover:border-white/30"><Icon name="download" className="h-4 w-4" /> Add to calendar (.ics)</a>
              <a href={gcal} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-cloud hover:border-white/30"><Icon name="calendar" className="h-4 w-4" /> Google Calendar</a>
            </div>
          </>
        )}
      </div>
      <div className="border-t border-white/[0.06] bg-midnight-900/40 px-6 py-6 md:px-10">
        {siteConfig.overviewVideoUrl ? (
          <>
            <p className="font-semibold text-cloud">Before we meet: watch a 2-minute NESJA overview.</p>
            <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-white/10">
              {siteConfig.overviewVideoUrl.endsWith(".mp4")
                ? <video src={siteConfig.overviewVideoUrl} controls className="h-full w-full" />
                : <iframe src={siteConfig.overviewVideoUrl} title="NESJA overview" className="h-full w-full" allow="encrypted-media; picture-in-picture" allowFullScreen loading="lazy" />}
            </div>
          </>
        ) : (
          <Link href="/resources/commercial-operating-system-manifesto" className="group flex items-center justify-between gap-4">
            <span><span className="block font-semibold text-cloud">Before we meet: read the Commercial OS Manifesto.</span><span className="text-sm text-mist">Nine minutes on why commercial organisations should run as one system.</span></span>
            <Icon name="arrowRight" className="h-5 w-5 shrink-0 text-teal transition-transform group-hover:translate-x-1 rtl:-scale-x-100" />
          </Link>
        )}
      </div>
    </div>
  );
}
