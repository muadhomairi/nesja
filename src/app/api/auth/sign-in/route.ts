import { signInSchema } from "@/lib/validation";
import { json, parseBody } from "@/lib/server/http";
import { beginSignIn } from "@/services/auth";

export async function POST(req: Request) {
  const parsed = await parseBody(req, signInSchema);
  if ("response" in parsed) return parsed.response;
  try {
    return json({ ok: true, ...(await beginSignIn(parsed.data.email)) });
  } catch (e) {
    console.error("[auth] sign-in failed", e);
    return json({ ok: false, error: "Sign-in is temporarily unavailable." }, 502);
  }
}
