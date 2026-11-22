"use client";
import { useState } from "react";
import { documentLink } from "@/app/actions/documents";
export function DownloadButton({ id }: { id: string }) {
  const [err, setErr] = useState<string | null>(null);
  return <span><button className="text-link hover:underline" onClick={async () => { const r = await documentLink(id); if (r.url) window.location.href = r.url; else setErr(r.error ?? "Unavailable"); }}>Open</button>{err && <span className="ms-2 text-xs text-muted">{err}</span>}</span>;
}
