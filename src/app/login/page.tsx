import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/forms/SignInForm";
import { LogoMark } from "@/components/ui/Logo";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({ title: "Sign In", description: "Sign in to NESJA.OS.", path: "/login", noIndex: true });

export default function LoginPage() {
  return (
    <section className="relative flex min-h-[85vh] items-center justify-center overflow-hidden px-5 pb-20 pt-32">
      <div className="pointer-events-none absolute inset-0 grid-bg" aria-hidden="true" />
      <div className="surface relative w-full max-w-md bg-midnight-800/80 p-8 md:p-10">
        <LogoMark className="h-10 w-10" />
        <h1 className="mt-6 text-2xl font-semibold text-cloud">Sign in to NESJA.OS</h1>
        <p className="mb-8 mt-2 text-sm text-mist">Enter your work email to continue.</p>
        <SignInForm />
        <p className="mt-8 border-t border-white/[0.06] pt-6 text-center text-sm text-mist">New to NESJA? <Link href="/book-demo" className="font-semibold text-teal hover:underline">Book a Demo</Link></p>
      </div>
    </section>
  );
}
