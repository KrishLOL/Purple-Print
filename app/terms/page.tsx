import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using Purpleprint.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <h1 className="text-2xl font-semibold sm:text-3xl">Terms</h1>
      <p className="mt-2 text-sm text-text-muted">
        Purpleprint is an independent, student-run site. It is not affiliated with, endorsed by,
        or operated by Western University or its Faculty of Engineering.
      </p>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-text-muted">Who can use it</h2>
        <p className="text-sm text-text">
          An account requires a valid @uwo.ca email address. Accounts are for individual, personal
          use — don&rsquo;t create or use an account on someone else&rsquo;s behalf, and don&rsquo;t
          share access to your own.
        </p>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-text-muted">Content you post</h2>
        <p className="text-sm text-text">
          You&rsquo;re responsible for what you write. By posting a review, you confirm it&rsquo;s
          your own honest account of a course you actually took, and you grant Purpleprint a
          license to host and publish it on the site (anonymously, per our{" "}
          <Link href="/privacy" className="text-accent underline underline-offset-4">
            privacy page
          </Link>
          ). See the{" "}
          <Link href="/guidelines" className="text-accent underline underline-offset-4">
            review guidelines
          </Link>{" "}
          for what is and isn&rsquo;t acceptable — allegations of misconduct, personal details about
          a professor, and naming other students are never allowed.
        </p>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-text-muted">Moderation</h2>
        <p className="text-sm text-text">
          We reserve the right to remove any review, suspend any account, and take other action we
          judge necessary to keep the site trustworthy — including for content that doesn&rsquo;t
          break a specific rule but is clearly bad-faith (e.g. reviews of a course you never took).
        </p>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-text-muted">No warranty</h2>
        <p className="text-sm text-text">
          Reviews reflect individual students&rsquo; opinions, not verified fact. Purpleprint is
          provided as-is, with no guarantee it&rsquo;s available, accurate, or error-free. Course
          and professor data is sourced from the public academic calendar and may be out of date.
        </p>
      </section>

      <section className="mt-8 border-t border-border pt-6">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-text-muted">Changes</h2>
        <p className="text-sm text-text">
          These terms may change as the site does. Continuing to use Purpleprint after a change
          means you accept the update.
        </p>
      </section>
    </main>
  );
}
