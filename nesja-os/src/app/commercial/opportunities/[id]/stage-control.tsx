"use client";
import { useState, useTransition } from "react";
import { changeStage } from "@/app/actions/commercial";
const STAGES = ["prospecting", "qualification", "solution", "proposal", "negotiation", "closed_won", "closed_lost"];
export function StageControl({ id, stage }: { id: string; stage: string }) {
  const [err, setErr] = useState<string | null>(null);
  const [target, setTarget] = useState(stage);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="text-xs text-muted">Stage{" "}
        <select disabled={pending} value={target} onChange={(e) => setTarget(e.target.value)} className="rounded-lg border border-line-strong bg-surface px-2 py-1.5 text-sm">
          {STAGES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select></label>
      {target === "closed_lost" && <input aria-label="Loss reason" placeholder="Loss reason" value={reason} onChange={(e) => setReason(e.target.value)} className="rounded-lg border border-line-strong bg-surface px-2 py-1.5 text-sm" />}
      <button disabled={pending || target === stage || (target === "closed_lost" && !reason.trim())} onClick={() => start(async () => setErr(await changeStage(id, target, reason)))}
        className="rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-semibold text-on-brand disabled:opacity-50">Update</button>
      {err && <span role="alert" className="basis-full text-end text-xs text-bad">{err}</span>}
    </div>
  );
}
