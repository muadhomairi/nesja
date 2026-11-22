import Link from "next/link";
import { AuthFrame } from "@/components/shell/auth-frame";
import { ActionForm } from "@/components/forms/action-form";
import { Field, Input } from "@/components/ui/primitives";
import { loginAction } from "@/app/actions/auth";
import { safeNext } from "@/app/actions/validation";

export const metadata = { title: "Sign in" };
export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; login_hint?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthFrame title="Sign in to NESJA" subtitle="Use your work e-mail." footer={<>New to NESJA? <Link href="/signup" className="font-semibold text-link hover:underline">Create an organization</Link></>}>
      <ActionForm action={loginAction} submit="Sign in" pending="Signing in…">
        <input type="hidden" name="next" value={safeNext(sp.next)} />
        <Field label="E-mail" htmlFor="email"><Input id="email" name="email" type="email" autoComplete="username" defaultValue={sp.login_hint ?? ""} required autoFocus /></Field>
        <Field label="Password" htmlFor="password"><Input id="password" name="password" type="password" autoComplete="current-password" required /></Field>
        <p className="text-end text-xs"><Link href="/auth/forgot" className="text-link hover:underline">Forgot password?</Link></p>
      </ActionForm>
      <p className="mt-4 text-center text-xs text-muted">Single sign-on (Microsoft Entra ID, Okta, SAML) is set up per organization by NESJA on request.</p>
    </AuthFrame>
  );
}
