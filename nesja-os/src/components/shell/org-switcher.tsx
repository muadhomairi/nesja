"use client";
import { useTransition } from "react";
import { switchOrg } from "@/app/actions/org";
export function OrgSwitcher({ orgs, current }: { orgs: { id: string; name: string; kind: string }[]; current: string | null }) {
  const [pending, start] = useTransition();
  if (orgs.length < 2) return <span className="hidden px-2 text-xs font-semibold text-muted md:inline">{orgs[0]?.name}</span>;
  return (
    <label className="hidden md:block"><span className="sr-only">Organization</span>
      <select disabled={pending} value={current ?? ""} onChange={(e) => start(() => switchOrg(e.target.value))} className="rounded-lg border border-line bg-surface-2 px-2 py-1 text-xs font-semibold">
        {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}{o.kind === "demo" ? " (demo)" : ""}</option>)}
      </select>
    </label>
  );
}
