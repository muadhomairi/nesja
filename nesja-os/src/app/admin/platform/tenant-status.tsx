"use client";
import { useTransition } from "react";
import { setTenantStatus } from "@/app/actions/platform";
export function TenantStatus({ id, status }: { id: string; status: string }) {
  const [pending, start] = useTransition();
  return <select aria-label="Tenant status" disabled={pending} defaultValue={status} onChange={(e) => start(() => setTenantStatus(id, e.target.value))} className="rounded border border-line bg-surface px-2 py-1 text-xs">
    {["trial", "active", "suspended", "closed"].map((x) => <option key={x}>{x}</option>)}</select>;
}
