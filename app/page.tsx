import Link from "next/link";
import { getLandingData } from "@/lib/landing";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { DisciplineTabs } from "@/components/home/discipline-tabs";
import { HeroSearch } from "@/components/home/hero-search";
import { CornerCard } from "@/components/ui/corner-card";

// This page has no request-time APIs (no searchParams/cookies/etc.), so
// Next would otherwise prerender it once at build time and bake in
// whatever the database looked like at that moment -- stats, disciplines,
// and reviews would then go stale until the next deploy. Force it to
// render fresh on every request instead.
export const dynamic = "force-dynamic";

export default async function Home() {
  const { stats, coreDisciplines, combinedDegreeDisciplines, topRated, recentlyReviewed } =
    await getLandingData();

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-8">
      <section className="text-center">
        <p className="font-num text-xs uppercase tracking-[0.2em] text-text-muted">
          Faculty of Engineering &middot; Western University
        </p>
        <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-semibold sm:text-5xl">
          Know before you register.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm text-text-muted">
          Real reviews of Western Engineering courses and professors, from the students who
          actually took them.
        </p>
        <div className="mt-8">
          <HeroSearch />
        </div>

        <dl className="font-num mt-10 flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wider text-text-muted">Courses indexed</dt>
            <dd className="text-2xl font-semibold">
              <AnimatedNumber value={stats.courseCount} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-text-muted">Professors tracked</dt>
            <dd className="text-2xl font-semibold">
              <AnimatedNumber value={stats.professorCount} />
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wider text-text-muted">Student reports</dt>
            <dd className="text-2xl font-semibold">
              <AnimatedNumber value={stats.reviewCount} />
            </dd>
          </div>
        </dl>
      </section>

      <section className="mt-20 border-t border-border pt-10">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="text-xs uppercase tracking-wider text-text-muted">Browse by discipline</h2>
          <Link href="/browse" className="text-xs text-accent underline underline-offset-4">
            See all courses
          </Link>
        </div>
        <DisciplineTabs
          coreDisciplines={coreDisciplines}
          combinedDegreeDisciplines={combinedDegreeDisciplines}
        />
      </section>

      {topRated.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="mb-6 text-xs uppercase tracking-wider text-text-muted">Top rated</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topRated.map((c) => (
              <Link key={c.code} href={`/course/${encodeURIComponent(c.code)}`}>
                <CornerCard className="h-full transition-colors hover:border-accent">
                  <p className="font-num text-xs uppercase tracking-wider text-text-muted">{c.code}</p>
                  <h3 className="mt-1 text-sm font-semibold">{c.title}</h3>
                  <p className="font-num mt-2 text-xs text-text-muted">
                    {c.useful}% useful &middot; {c.reviewCount} review{c.reviewCount === 1 ? "" : "s"}
                  </p>
                </CornerCard>
              </Link>
            ))}
          </div>
        </section>
      )}

      {recentlyReviewed.length > 0 && (
        <section className="mt-16 border-t border-border pt-10">
          <h2 className="mb-6 text-xs uppercase tracking-wider text-text-muted">Recently reviewed</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentlyReviewed.map((c) => (
              <Link key={c.code} href={`/course/${encodeURIComponent(c.code)}`}>
                <CornerCard className="h-full transition-colors hover:border-accent">
                  <p className="font-num text-xs uppercase tracking-wider text-text-muted">{c.code}</p>
                  <h3 className="mt-1 text-sm font-semibold">{c.title}</h3>
                </CornerCard>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-16 border-t border-border pt-10 text-center">
        <p className="text-sm text-text-muted">Comparing electives?</p>
        <Link
          href="/compare"
          className="font-num mt-3 inline-block border border-accent bg-accent px-5 py-2.5 text-xs uppercase tracking-wider text-accent-contrast hover:opacity-90"
        >
          Compare courses side by side
        </Link>
      </section>

      <section className="mt-8 text-center">
        <p className="text-sm text-text-muted">Planning your degree?</p>
        <Link
          href="/plan"
          className="font-num mt-3 inline-block border border-accent px-5 py-2.5 text-xs uppercase tracking-wider text-accent hover:bg-accent hover:text-accent-contrast"
        >
          See your degree roadmap
        </Link>
      </section>

      <section className="mt-8 text-center">
        <p className="text-sm text-text-muted">Curious how courses connect?</p>
        <Link
          href="/paths"
          className="font-num mt-3 inline-block border border-accent px-5 py-2.5 text-xs uppercase tracking-wider text-accent hover:bg-accent hover:text-accent-contrast"
        >
          See prerequisite paths
        </Link>
      </section>
    </main>
  );
}
