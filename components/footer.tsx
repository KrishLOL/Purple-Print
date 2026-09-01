import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-border px-4 py-6 text-center text-xs text-text-muted sm:px-8">
      <p>Not affiliated with Western University or the Faculty of Engineering. Built by students.</p>
      <p className="mt-2 flex justify-center gap-4">
        <Link href="/guidelines" className="hover:text-text">
          Guidelines
        </Link>
        <Link href="/privacy" className="hover:text-text">
          Privacy
        </Link>
        <Link href="/terms" className="hover:text-text">
          Terms
        </Link>
        <a href="mailto:purpleprint.app@gmail.com" className="hover:text-text">
          Contact
        </a>
      </p>
    </footer>
  );
}
