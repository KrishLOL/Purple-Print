import type { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { parseCompareParams, MIN_COMPARE_ITEMS } from "@/lib/compare/params";
import { getCompareCourses, getCompareProfessors } from "@/lib/compare/query";
import { ComparePicker } from "@/components/compare/compare-picker";
import { CourseCompareTable, ProfessorCompareTable } from "@/components/compare/compare-table";

export const metadata: Metadata = {
  title: "Compare",
  description: "Compare courses or professors side by side.",
};

export default async function ComparePage({ searchParams }: PageProps<"/compare">) {
  const raw = await searchParams;
  const params = parseCompareParams(raw);

  const options =
    params.type === "courses"
      ? (
          await prisma.course.findMany({
            select: { id: true, code: true, title: true, discipline: { select: { name: true } } },
            orderBy: { code: "asc" },
          })
        ).map((c) => ({
          id: c.id,
          label: c.code,
          sublabel: c.title,
          groupLabel: c.discipline?.name ?? "Other",
        }))
      : (
          await prisma.professor.findMany({
            select: { id: true, firstName: true, lastName: true, title: true },
            orderBy: { lastName: "asc" },
          })
        ).map((p) => ({ id: p.id, label: `${p.firstName} ${p.lastName}`, sublabel: p.title }));

  const courses = params.type === "courses" ? await getCompareCourses(params.ids) : [];
  const professors = params.type === "professors" ? await getCompareProfessors(params.ids) : [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <h1 className="mb-1 text-2xl font-semibold">Compare</h1>
      <p className="mb-6 text-sm text-text-muted">
        Pick {MIN_COMPARE_ITEMS}-4 {params.type} to line up side by side.
      </p>

      <Suspense>
        <ComparePicker options={options} />
      </Suspense>

      <div className="mt-8">
        {params.ids.length < MIN_COMPARE_ITEMS ? (
          <p className="border border-border bg-surface p-6 text-center text-sm text-text-muted">
            Pick at least {MIN_COMPARE_ITEMS} {params.type} to see a comparison.
          </p>
        ) : params.type === "courses" ? (
          <CourseCompareTable courses={courses} />
        ) : (
          <ProfessorCompareTable professors={professors} />
        )}
      </div>
    </main>
  );
}
