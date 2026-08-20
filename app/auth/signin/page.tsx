import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { signInWithEmail } from "@/app/auth/actions";

export const metadata: Metadata = { title: "Sign in" };

export default function SignInPage() {
  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col justify-center px-4 py-16 sm:px-8">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm text-text-muted">
        Purpleprint is for Western Engineering students. Sign-in is restricted to{" "}
        <span className="font-num">@uwo.ca</span> addresses — we&rsquo;ll email you a link, no
        password needed.
      </p>

      <form action={signInWithEmail} className="mt-6 space-y-3">
        <label htmlFor="email" className="block text-xs uppercase tracking-wider text-text-muted">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@uwo.ca"
          className="w-full border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
        <Button type="submit" variant="primary" className="w-full">
          Send magic link
        </Button>
      </form>
    </main>
  );
}
