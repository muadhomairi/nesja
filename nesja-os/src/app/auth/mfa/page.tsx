import { AuthFrame } from "@/components/shell/auth-frame";
import { ActionForm } from "@/components/forms/action-form";
import { Field, Input } from "@/components/ui/primitives";
import { verifyTotp } from "@/app/actions/mfa";
import { safeNext } from "@/app/actions/validation";
export const metadata = { title: "Two-step verification" };
export default async function Mfa({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthFrame title="Two-step verification" subtitle="Enter the 6-digit code from your authenticator app.">
      <ActionForm action={verifyTotp} submit="Verify">
        <input type="hidden" name="next" value={safeNext(sp.next)} />
        <Field label="Code" htmlFor="code"><Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" required autoFocus /></Field>
      </ActionForm>
    </AuthFrame>
  );
}
