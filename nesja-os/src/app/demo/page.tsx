import { AuthFrame } from "@/components/shell/auth-frame";
import { ActionForm } from "@/components/forms/action-form";
import { startDemo } from "@/app/actions/demo";
export const metadata = { title: "Interactive demo" };
export default function Demo() {
  return (
    <AuthFrame title="Explore NESJA Commercial" subtitle="A private, read-only session in Northstar Global Services: a fictional managed-services company with 24 months of USD data.">
      <ul className="mb-6 space-y-1 text-sm text-muted">
        <li>· 150 accounts, 250 opportunities, 180 quotations, 120 agreements</li>
        <li>· Six guided journeys from lead to contract, tender, renewal and margin recovery</li>
        <li>· Every company, person and figure is synthetic</li>
      </ul>
      <ActionForm action={async (s) => startDemo(s)} submit="Start the demo" pending="Preparing your session…"><span /></ActionForm>
      <p className="mt-3 text-xs text-subtle">Your demo session is removed after 24 hours.</p>
    </AuthFrame>
  );
}
