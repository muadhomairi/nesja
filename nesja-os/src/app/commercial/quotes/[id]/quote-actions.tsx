"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reviseQuote, setQuoteStatus, submitQuote } from "@/app/actions/commercial";
export function QuoteActions({ id, status }: { id: string; status: string }) {
  const [err, setErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  const run = (fn: () => Promise<string | null>) => start(async () => { const e = await fn(); setErr(e); if (!e) router.refresh(); });
  const b = "rounded-lg border border-line-strong px-3 py-1.5 text-sm font-semibold hover:bg-hover disabled:opacity-50";
  return (
    <div className="flex flex-wrap items-center gap-2">
      {status === "draft" && <button className={b} disabled={pending} onClick={() => run(() => submitQuote(id))}>Submit</button>}
      {["submitted", "approved"].includes(status) && <button className={b} disabled={pending} onClick={() => run(() => setQuoteStatus(id, "issued"))}>Issue to customer</button>}
      {status === "issued" && <><button className={b} disabled={pending} onClick={() => run(() => setQuoteStatus(id, "accepted"))}>Mark accepted</button><button className={b} disabled={pending} onClick={() => run(() => setQuoteStatus(id, "rejected"))}>Mark rejected</button></>}
      {["issued", "rejected", "approved", "submitted"].includes(status) && <button className={b} disabled={pending} onClick={() => start(async () => { const r = await reviseQuote(id); if (r.error) setErr(r.error); else router.push(`/commercial/quotes/${r.id}`); })}>New revision</button>}
      {err && <span role="alert" className="text-xs text-bad">{err}</span>}
    </div>
  );
}
