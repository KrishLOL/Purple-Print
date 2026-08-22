"use client";

/**
 * Deliberately NOT a plain <a href> — a first attempt at this page used
 * one, and the destination still got consumed before the user clicked
 * anything. That means whatever's scanning uwo.ca mail doesn't just visit
 * the emailed link once; it also crawls the resulting page's HTML and
 * follows the links it finds there. A static href is exactly what a
 * crawler like that looks for and follows automatically.
 *
 * Gating the navigation behind a real onClick handler means the URL is
 * only ever requested in response to an actual browser click event —
 * something link-following crawlers (which fetch HTML and parse href
 * attributes, not simulate user input) don't do. A full navigation
 * (window.location.href, not client-side routing) so redirects and
 * Set-Cookie from the Auth.js callback behave exactly like a normal link
 * click would.
 */
export function ConfirmSignInButton({ url }: { url: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        window.location.href = url;
      }}
      className="font-num mt-6 inline-flex items-center justify-center gap-2 bg-accent px-4 py-2.5 text-xs uppercase tracking-wider text-accent-contrast transition-colors hover:opacity-90"
    >
      Confirm sign-in
    </button>
  );
}
