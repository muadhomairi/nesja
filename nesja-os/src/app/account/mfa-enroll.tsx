"use client";
import { useState } from "react";
import { enrollTotp, verifyTotp } from "@/app/actions/mfa";
import { ActionForm } from "@/components/forms/action-form";
import { Field, Input, Notice } from "@/components/ui/primitives";
export function MfaEnroll() {
  const [f, setF] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  if (!f) return (<div className="space-y-2">{err && <Notice tone="bad">{err}</Notice>}
    <button className="rounded-lg bg-brand-500 px-3 py-2 text-sm font-semibold text-on-brand" onClick={async () => { const r = await enrollTotp(); if ("error" in r) setErr(r.error); else setF(r); }}>Set up an authenticator app</button></div>);
  return (
    <div className="space-y-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={f.qr} alt="QR code for your authenticator app" className="h-40 w-40 rounded bg-white p-2" />
      <p className="text-xs text-muted">Or enter this key: <code className="break-all">{f.secret}</code></p>
      <ActionForm action={verifyTotp} submit="Confirm">
        <input type="hidden" name="factorId" value={f.factorId} /><input type="hidden" name="next" value="/account" />
        <Field label="6-digit code" htmlFor="code"><Input id="code" name="code" inputMode="numeric" required /></Field>
      </ActionForm>
    </div>
  );
}
