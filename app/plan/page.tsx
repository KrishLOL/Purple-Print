import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { RoadmapView } from "@/components/plan/roadmap-view";

export const metadata: Metadata = {
  title: "Degree Roadmap",
  description: "See your discipline's courses laid out term by term, including where the elective slots are.",
};

// Only disciplines with a clean standalone Progression Sheet are shown here.
// Year 1 is identical across every discipline, so it's linked out to rather
// than duplicated per discipline.
const PLAN_DISCIPLINE_ORDER = [
  "chemical",
  "civil",
  "electrical",
  "integrated",
  "mechanical",
  "mechatronics",
  "software",
];

// AISE and Biomedical are combined degrees layered on top of one of these 4
// base disciplines (civil, integrated, and software have no AISE/BME
// option) -- see prisma/seed-data/progression-combined.ts. Keyed by base
// discipline slug -> the overlay slugs that discipline actually offers.
const COMBO_OVERLAYS_BY_BASE: Record<string, string[]> = {
  electrical: ["aise", "biomedical"],
  mechanical: ["aise", "biomedical"],
  mechatronics: ["aise", "biomedical"],
  chemical: ["aise", "biomedical"],
};

export default async function PlanPage({ searchParams }: PageProps<"/plan">) {
  const raw = await searchParams;
  const rawSlug = Array.isArray(raw.discipline) ? raw.discipline[0] : raw.discipline;
  const rawOverlay = Array.isArray(raw.overlay) ? raw.overlay[0] : raw.overlay;

  const [disciplines, overlayDisciplines] = await Promise.all([
    prisma.discipline.findMany({
      where: { slug: { in: PLAN_DISCIPLINE_ORDER } },
      select: { slug: true, name: true, colorAccent: true },
    }),
    prisma.discipline.findMany({
      where: { slug: { in: ["aise", "biomedical"] } },
      select: { id: true, slug: true, name: true },
    }),
  ]);
  const orderedDisciplines = [...disciplines].sort(
    (a, b) => PLAN_DISCIPLINE_ORDER.indexOf(a.slug) - PLAN_DISCIPLINE_ORDER.indexOf(b.slug),
  );

  const selectedSlug =
    rawSlug && orderedDisciplines.some((d) => d.slug === rawSlug) ? rawSlug : (orderedDisciplines[0]?.slug ?? "");

  const availableOverlaySlugs = COMBO_OVERLAYS_BY_BASE[selectedSlug] ?? [];
  const availableOverlays = overlayDisciplines
    .filter((d) => availableOverlaySlugs.includes(d.slug))
    .map(({ slug, name }) => ({ slug, name }));
  const selectedOverlay = rawOverlay
    ? (overlayDisciplines.find((d) => d.slug === rawOverlay && availableOverlaySlugs.includes(d.slug)) ?? null)
    : null;

  const slots = await prisma.progressionSlot.findMany({
    where: {
      discipline: { slug: selectedSlug },
      overlayDisciplineId: selectedOverlay?.id ?? null,
    },
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
        . If you&rsquo;re in one of the double-degree programs (AISE or Biomedical Engineering), pick it
        from the second dropdown below for the full 5-year combined sequence.
      </p>
      <RoadmapView
        disciplines={orderedDisciplines}
        selectedSlug={selectedSlug}
        availableOverlays={availableOverlays}
        selectedOverlaySlug={selectedOverlay?.slug ?? null}
        slots={slots}
      />
    </main>
  );
}
