import { AuthFrame } from "@/components/shell/auth-frame";
import { Notice } from "@/components/ui/primitives";
export const metadata = { title: "Setup required" };
export default function SetupRequired() {
  return (
    <AuthFrame title="This environment is not connected yet">
      <Notice tone="warn">NESJA.OS needs its Supabase project. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY and DATABASE_URL (see .env.example).</Notice>
    </AuthFrame>
  );
}
