"use client";
import { useState, useTransition } from "react";
import { decideApproval } from "@/app/actions/commercial";
export function Decide({ id }: { id: string }) {
  const [note, setNote] = useState(""); const [err, setErr] = useState<string | null>(null); const [pending, start] = useTransition();
  const go = (d: "approved" | "rejected") => start(async () => setErr(await decideApproval(id, d, note)));
  return (
    <div className="flex flex-wrap items-center gap-1">
      <input aria-label="Decision note" placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} className="w-28 rounded border border-line px-2 py-1 text-xs" />
      <button disabled={pending} onClick={() => go("approved")} className="rounded bg-ok px-2 py-1 text-xs font-semibold text-white">Approve</button>
      <button disabled={pending || !note.trim()} title="A note is required to reject" onClick={() => go("rejected")} className="rounded bg-bad px-2 py-1 text-xs font-semibold text-white disabled:opacity-50">Reject</button>
      {err && <span role="alert" className="text-xs text-bad">{err}</span>}
    </div>
  );
}
