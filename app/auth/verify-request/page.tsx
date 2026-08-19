import type { Metadata } from "next";

export const metadata: Metadata = { title: "Check your email" };

export default function VerifyRequestPage() {
  return (
    <main className="mx-auto flex max-w-sm flex-1 flex-col justify-center px-4 py-16 text-center sm:px-8">
      <h1 className="text-2xl font-semibold">Check your email</h1>
      <p className="mt-2 text-sm text-text-muted">
        We&rsquo;ve sent a sign-in link to your <span className="font-num">@uwo.ca</span> address.
        It expires shortly, so use it soon.
      </p>
    </main>
  );
}
