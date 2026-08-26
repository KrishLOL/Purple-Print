import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { RoadmapView } from "@/components/plan/roadmap-view";

export const metadata: Metadata = {
  title: "Degree Roadmap",
  description: "See your discipline's courses laid out term by term, including where the elective slots are.",
};

// Only disciplines with a clean standalone Progression Sheet are shown here.
// AISE and Biomedical are combined degrees layered on a base discipline
// rather than a path of their own, so they're deliberately excluded rather
// than shown with a misleading grid. Year 1 is identical across every
// discipline, so it's linked out to rather than duplicated per discipline.
const PLAN_DISCIPLINE_ORDER = [
  "chemical",
  "civil",
  "electrical",
  "integrated",
  "mechanical",
  "mechatronics",
  "software",
];

export default async function PlanPage({ searchParams }: PageProps<"/plan">) {
  const raw = await searchParams;
  const rawSlug = Array.isArray(raw.discipline) ? raw.discipline[0] : raw.discipline;

  const disciplines = await prisma.discipline.findMany({
    where: { slug: { in: PLAN_DISCIPLINE_ORDER } },
    select: { slug: true, name: true, colorAccent: true },
  });
  const orderedDisciplines = [...disciplines].sort(
    (a, b) => PLAN_DISCIPLINE_ORDER.indexOf(a.slug) - PLAN_DISCIPLINE_ORDER.indexOf(b.slug),
  );

  const selectedSlug =
    rawSlug && orderedDisciplines.some((d) => d.slug === rawSlug) ? rawSlug : (orderedDisciplines[0]?.slug ?? "");

  const slots = await prisma.progressionSlot.findMany({
    where: { discipline: { slug: selectedSlug } },
    select: {
      yearLevel: true,
      term: true,
      sortOrder: true,
      electiveLabel: true,
      course: { select: { code: true, title: true } },
    },
    orderBy: [{ yearLevel: "asc" }, { term: "asc" }, { sortOrder: "asc" }],
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <h1 className="mb-1 text-2xl font-semibold">Degree Roadmap</h1>
      <p className="mb-6 max-w-2xl text-sm text-text-muted">
        Your discipline&rsquo;s courses laid out term by term, following Western&rsquo;s official
        progression sequence — including where the elective slots are, not just the fixed
        requirements. Year 1 is the same for every discipline; see it on the{" "}
        <Link href="/browse?discipline=first-year" className="text-accent underline underline-offset-4">
          First Year course list
        </Link>
        . For how these courses depend on each other rather than when you take them, see{" "}
        <Link
          href={`/paths?discipline=${selectedSlug}`}
          className="text-accent underline underline-offset-4"
        >
          Prerequisite Paths
        </Link>
        .
      </p>
      <RoadmapView disciplines={orderedDisciplines} selectedSlug={selectedSlug} slots={slots} />
    </main>
  );
}
