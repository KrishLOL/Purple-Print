import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

// Deliberately does not call auth() here: this header is shared by every
// page via the root layout, and reading the session would force the entire
// site (including pages with no session-dependent content) out of static
// prerendering, since Cache Components/PPR isn't enabled (see next.config.ts).
// "/me" is a single stable link — it redirects to /auth/signin itself when
// there's no session, so this stays correct without knowing auth state here.
export function SiteHeader() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Link href="/" className="font-num text-sm uppercase tracking-[0.2em]">
          Purpleprint
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/browse" className="text-text-muted hover:text-text">
            Browse
          </Link>
          <Link href="/me" className="text-text-muted hover:text-text">
            Account
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
