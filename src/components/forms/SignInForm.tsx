"use client";
import { useState } from "react";
import { emailField } from "@/lib/validation";
import { postJson } from "@/lib/api-client";
import { track } from "@/lib/analytics";
import { Button } from "@/components/ui/Button";
import { TextField, FormAlert } from "@/components/ui/Field";

/** Hands the user to the NESJA application's identity flow (see src/services/auth). */
export function SignInForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = emailField.safeParse(email);
    if (!r.success) return setError(r.error.issues[0].message);
    setError(""); setNotice(""); setLoading(true);
    track("sign_in_started", { method: "email" });
    const res = await postJson<{ status: "redirect" | "not_configured"; url?: string; message?: string }>("/api/auth/sign-in", { email });
    if (res.ok && res.status === "redirect" && res.url) { window.location.assign(res.url); return; }
    setLoading(false);
    if (res.ok) setNotice(res.message ?? "");
    else setError(res.error);
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <TextField label="Work email" name="signin-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} error={error} autoFocus />
      {notice && <FormAlert tone="info">{notice}</FormAlert>}
      <Button type="submit" size="lg" className="w-full" loading={loading}>{loading ? "Redirecting…" : "Continue"}</Button>
      <p className="text-center text-xs text-mist">You&apos;ll continue to your organisation&apos;s secure NESJA sign-in, including single sign-on where your administrator has enabled it.</p>
    </form>
  );
}
