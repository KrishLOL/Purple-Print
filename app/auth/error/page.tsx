import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Sign-in error" };

const MESSAGES: Record<string, string> = {
  domain: "Only @uwo.ca email addresses can sign in to Purpleprint.",
  banned: "This account has been suspended. Contact us if you think that's a mistake.",
  "send-failed": "We couldn't send that sign-in link — you may be sending requests too quickly. Try again shortly.",
  Verification: "That sign-in link is invalid or has expired. Request a new one.",
  AccessDenied: "Access denied for that account.",
  Configuration: "Sign-in is temporarily unavailable. Try again later.",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string; error?: string }>;
}) {
  const { reason, error } = await searchParams;
  const message = MESSAGES[reason ?? error ?? ""] ?? "Something went wrong signing you in.";

  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col justify-center px-4 py-16 text-center sm:px-8">
      <h1 className="text-2xl font-semibold text-bad">Sign-in error</h1>
      <p className="mt-2 text-sm text-text-muted">{message}</p>
      <Link href="/auth/signin" className="mt-6 text-sm text-accent underline underline-offset-4">
        Back to sign in
      </Link>
    </main>
  );
}
