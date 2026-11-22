"use client";
import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "@/app/actions/validation";
import { Notice } from "@/components/ui/primitives";

function Submit({ children, pending }: { children: ReactNode; pending: string }) {
  const s = useFormStatus();
  return <button type="submit" disabled={s.pending} className="w-full rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-semibold text-on-brand hover:bg-brand-400 disabled:opacity-60">{s.pending ? pending : children}</button>;
}

export function ActionForm({ action, children, submit, pending = "Working…", hideOnSuccess = false }: {
  action: (s: FormState, f: FormData) => Promise<FormState>; children: ReactNode; submit: string; pending?: string; hideOnSuccess?: boolean;
}) {
  const [state, formAction] = useActionState(action, null);
  return (
    <form action={formAction} className="space-y-4">
      {state?.message && <Notice tone={state.ok ? "ok" : "bad"}>{state.message}</Notice>}
      {!(hideOnSuccess && state?.ok) && <>{children}<Submit pending={pending}>{submit}</Submit></>}
    </form>
  );
}
