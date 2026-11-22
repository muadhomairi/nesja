import { AuthFrame } from "@/components/shell/auth-frame";
import { ActionForm } from "@/components/forms/action-form";
import { Field, Input } from "@/components/ui/primitives";
import { resetAction } from "@/app/actions/auth";
export const metadata = { title: "Choose a new password" };
export default function Reset() {
  return (
    <AuthFrame title="Choose a new password">
      <ActionForm action={resetAction} submit="Save password">
        <Field label="New password" htmlFor="password" hint="At least 12 characters with upper and lower case letters and a number."><Input id="password" name="password" type="password" autoComplete="new-password" required /></Field>
        <Field label="Confirm password" htmlFor="confirm"><Input id="confirm" name="confirm" type="password" autoComplete="new-password" required /></Field>
      </ActionForm>
    </AuthFrame>
  );
}
