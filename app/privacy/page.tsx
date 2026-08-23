import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Purpleprint collects and why.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">Privacy</h1>
      <p className="mt-2 text-sm text-text-muted">
        Short version: your email verifies you&rsquo;re a real Western Engineering student and
        signs you in. It&rsquo;s never shown publicly, and it&rsquo;s never attached to a review.
      </p>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-text-muted">What we collect</h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-text">
          <li>Your @uwo.ca email address, so we can verify you&rsquo;re a Western student and sign you in.</li>
          <li>A one-way hash of that email and which domain it came from, used internally to prevent duplicate accounts. The hash can&rsquo;t practically be reversed back into your address.</li>
          <li>Discipline and grad year, only if you choose to set them in account settings.</li>
          <li>Reviews, votes, and reports you submit, plus a session cookie that keeps you signed in.</li>
        </ul>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-text-muted">How sign-in works</h2>
        <p className="text-sm text-text">
          There&rsquo;s no password. Signing in sends a 6-digit code to your @uwo.ca email that expires
          in 15 minutes and can only be used once. We use it purely to confirm you own that address —
          non-@uwo.ca addresses are rejected before anything is ever sent.
        </p>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-text-muted">What&rsquo;s public</h2>
        <p className="text-sm text-text">
          Reviews are public but anonymous: readers see your self-reported discipline and grad year
          (e.g. &ldquo;Mechanical Eng., Class of &rsquo;27&rdquo;), never your name or email. If you
          haven&rsquo;t set a discipline or grad year, reviews just show as &ldquo;Western Engineering
          student.&rdquo;
        </p>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-text-muted">Your data, your control</h2>
        <ul className="list-inside list-disc space-y-2 text-sm text-text">
          <li>Change or clear your discipline/grad year any time from account settings.</li>
          <li>Delete any review you&rsquo;ve written from account settings, any time.</li>
        </ul>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-text-muted">Moderation</h2>
        <p className="text-sm text-text">
          Reports against a review and actions moderators take (approve, remove, ban) are logged
          internally for accountability — see the{" "}
          <Link href="/guidelines" className="text-accent underline underline-offset-4">
            review guidelines
          </Link>{" "}
          for how that screening works.
        </p>
      </section>

      <section className="mt-8 border-t border-border pt-6 text-xs text-text-muted">
        This is a small, independent student project — not a company, and not affiliated with
        Western University. This page describes how the site actually works, not a legal
        department&rsquo;s boilerplate.
      </section>
    </main>
  );
}
