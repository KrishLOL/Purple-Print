import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="font-num text-xs uppercase tracking-[0.2em] text-text-muted">
        Faculty of Engineering &middot; Western University
      </p>
      <h1 className="mt-4 max-w-2xl text-4xl font-semibold sm:text-5xl">
        Western Eng Insider
      </h1>
      <p className="mt-4 max-w-md text-sm text-text-muted">
        Course and professor reviews, built by students. Under construction — the design system
        lives at{" "}
        <Link href="/styleguide" className="text-accent underline underline-offset-4">
          /styleguide
        </Link>
        .
      </p>
    </main>
  );
}
