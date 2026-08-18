import Link from "next/link";

export function StickyWriteReviewCta({ href }: { href: string }) {
  return (
    <div className="sticky bottom-4 z-20 mt-8 flex justify-center">
      <Link
        href={href}
        className="font-num border border-accent bg-accent px-6 py-3 text-xs uppercase tracking-wider text-accent-contrast shadow-lg transition-opacity hover:opacity-90"
      >
        Write a review
      </Link>
    </div>
  );
}
