"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";

/** Invitation and magic links arrive with tokens in the URL fragment; store the session, then continue. */
export default function Confirm() {
  const [msg, setMsg] = useState("Signing you in…");
  useEffect(() => {
    const h = new URLSearchParams(window.location.hash.slice(1));
    const q = new URLSearchParams(window.location.search);
    const next = /^\/(?!\/)/.test(q.get("next") ?? "") ? q.get("next")! : "/launcher";
    const access_token = h.get("access_token"), refresh_token = h.get("refresh_token");
    if (!access_token || !refresh_token) { setMsg("This link is not valid or has expired."); return; }
    supabaseBrowser().auth.setSession({ access_token, refresh_token }).then(({ error }) => {
      if (error) { setMsg("This link is not valid or has expired."); return; }
      const setpw = h.get("type") === "invite" || q.get("setpw") === "1";
      window.location.replace(setpw ? `${next}${next.includes("?") ? "&" : "?"}setpw=1` : next);
    });
  }, []);
  return <main className="grid min-h-screen place-items-center text-sm text-muted">{msg}</main>;
}
