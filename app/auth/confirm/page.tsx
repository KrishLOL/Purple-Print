import type { Metadata } from "next";
import Link from "next/link";
import { getSiteUrl } from "@/lib/site";
import { ConfirmSignInButton } from "@/components/auth/confirm-button";

export const metadata: Metadata = { title: "Confirm sign-in" };

/**
 * Only ever hands the confirm button a URL that's genuinely one of our
 * own Auth.js callback endpoints on our own origin — this page takes an
 * attacker-influenceable `url` search param (anyone can craft a link to
 * /auth/confirm?url=...), so without this check it would be an open
 * redirect: someone could mint a link that *looks* like a Purpleprint
 * sign-in confirmation but actually sends a clicking user somewhere else
 * entirely.
 */
function getSafeCallbackUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  const site = new URL(getSiteUrl());
  if (parsed.origin !== site.origin) return null;
  if (!parsed.pathname.startsWith("/api/auth/callback/")) return null;
  return parsed.toString();
}

export default async function ConfirmSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ url?: string }>;
}) {
  const { url } = await searchParams;
  const safeUrl = getSafeCallbackUrl(url);

  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col justify-center px-4 py-16 text-center sm:px-8">
      <h1 className="text-2xl font-semibold">Confirm sign-in</h1>
      {safeUrl ? (
        <>
          <p className="mt-2 text-sm text-text-muted">
            One more click to finish signing in — this extra step exists because some university
            email systems automatically open links to scan them, which would otherwise use up
            your one-time sign-in link before you get to it.
          </p>
          <ConfirmSignInButton url={safeUrl} />
        </>
      ) : (
        <>
          <p className="mt-2 text-sm text-text-muted">
            That confirmation link is invalid or has expired. Request a new one.
          </p>
          <Link href="/auth/signin" className="mt-6 text-sm text-accent underline underline-offset-4">
            Back to sign in
          </Link>
        </>
      )}
    </main>
  );
}
