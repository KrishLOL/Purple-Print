import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { ConfirmSignInButton } from "@/components/auth/confirm-button";

export const metadata: Metadata = { title: "Confirm sign-in" };

// Matches Auth.js's own default magic-link expiry (24h) — a
// PendingMagicLink row older than this is treated as invalid rather than
// left to accumulate indefinitely. The real security boundary is still
// Auth.js's own VerificationToken expiry/single-use check; this is just
// hygiene for the id -> URL lookup table.
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

function isExpired(createdAt: Date): boolean {
  return Date.now() - createdAt.getTime() > MAX_AGE_MS;
}

export default async function ConfirmSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const pending = id ? await prisma.pendingMagicLink.findUnique({ where: { id } }) : null;
  const targetUrl = pending && !isExpired(pending.createdAt) ? pending.targetUrl : null;

  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col justify-center px-4 py-16 text-center sm:px-8">
      <h1 className="text-2xl font-semibold">Confirm sign-in</h1>
      {targetUrl ? (
        <>
          <p className="mt-2 text-sm text-text-muted">
            One more click to finish signing in — this extra step exists because some university
            email systems automatically open or rewrite links to scan them, which would otherwise
            use up your one-time sign-in link before you get to it.
          </p>
          <ConfirmSignInButton url={targetUrl} />
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
