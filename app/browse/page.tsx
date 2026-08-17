import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { parseBrowseParams } from "@/lib/browse/params";
import { getCourseRows, getProfessorRows } from "@/lib/browse/query";
import { TabSwitcher } from "@/components/browse/tab-switcher";
import { BrowseFilters } from "@/components/browse/filters";
import { BrowseResults } from "@/components/browse/results";

export const metadata: Metadata = {
  title: "Browse",
  description: "Browse Western Engineering courses and professors.",
};

export default async function BrowsePage({ searchParams }: PageProps<"/browse">) {
  const raw = await searchParams;
  const params = parseBrowseParams(raw);

  const disciplines = await prisma.discipline.findMany({
    orderBy: { name: "asc" },
    select: { slug: true, name: true, colorAccent: true, glyphKey: true },
  });

  const [courseRows, professorRows] = await Promise.all([
    params.tab === "courses" ? getCourseRows(params) : Promise.resolve([]),
    params.tab === "professors" ? getProfessorRows(params) : Promise.resolve([]),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold sm:text-3xl">Browse</h1>
        <p className="mt-1 text-sm text-text-muted">
          Filter and sort every course and professor on the site.
        </p>
      </header>

      <Suspense>
        <div className="mb-6">
          <TabSwitcher />
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <BrowseFilters disciplines={disciplines} />
          <BrowseResults courseRows={courseRows} professorRows={professorRows} />
        </div>
      </Suspense>
    </main>
  );
}
