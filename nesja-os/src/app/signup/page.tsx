import Link from "next/link";
import { AuthFrame } from "@/components/shell/auth-frame";
import { ActionForm } from "@/components/forms/action-form";
import { Field, Input } from "@/components/ui/primitives";
import { signupAction } from "@/app/actions/auth";

export const metadata = { title: "Create your NESJA account" };
export default function Signup() {
  return (
    <AuthFrame title="Create your NESJA account" subtitle="Start a 30-day trial of NESJA Commercial. No payment details needed." footer={<>Already have an account? <Link href="/login" className="font-semibold text-link hover:underline">Sign in</Link></>}>
      <ActionForm action={signupAction} submit="Create account" pending="Creating…" hideOnSuccess>
        <Field label="Full name" htmlFor="full_name"><Input id="full_name" name="full_name" autoComplete="name" required /></Field>
        <Field label="Work e-mail" htmlFor="email"><Input id="email" name="email" type="email" autoComplete="email" required /></Field>
        <Field label="Password" htmlFor="password" hint="At least 12 characters with upper and lower case letters and a number."><Input id="password" name="password" type="password" autoComplete="new-password" required /></Field>
      </ActionForm>
    </AuthFrame>
  );
}
