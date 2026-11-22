import Link from "next/link";
import { AuthFrame } from "@/components/shell/auth-frame";
import { ActionForm } from "@/components/forms/action-form";
import { Field, Input } from "@/components/ui/primitives";
import { forgotAction } from "@/app/actions/auth";
export const metadata = { title: "Reset password" };
export default function Forgot() {
  return (
    <AuthFrame title="Reset your password" subtitle="We'll e-mail you a link to choose a new one." footer={<Link href="/login" className="text-link hover:underline">Back to sign in</Link>}>
      <ActionForm action={forgotAction} submit="Send reset link" hideOnSuccess>
        <Field label="E-mail" htmlFor="email"><Input id="email" name="email" type="email" required autoFocus /></Field>
      </ActionForm>
    </AuthFrame>
  );
}
