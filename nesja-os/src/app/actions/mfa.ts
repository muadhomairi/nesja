"use server";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";
import { safeNext, type FormState } from "./validation";

export async function enrollTotp(): Promise<{ factorId: string; qr: string; secret: string } | { error: string }> {
  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Authenticator ${new Date().toISOString().slice(0, 10)}` });
  if (error || !data) return { error: "Could not start authenticator setup." };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function verifyTotp(_: FormState, form: FormData): Promise<FormState> {
  const code = String(form.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { ok: false, message: "Enter the 6-digit code from your authenticator app." };
  const supabase = await supabaseServer();
  let factorId = String(form.get("factorId") ?? "");
  if (!factorId) {
    const { data } = await supabase.auth.mfa.listFactors();
    factorId = data?.totp.find((f) => f.status === "verified")?.id ?? "";
  }
  if (!factorId) return { ok: false, message: "No authenticator is set up for this account." };
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { ok: false, message: "That code is not valid. Codes change every 30 seconds." };
  redirect(safeNext(form.get("next")));
}
