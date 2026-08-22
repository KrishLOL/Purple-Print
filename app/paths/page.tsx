import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { buildPrereqGraph, computeLayoutColumns, selectDisciplineSubgraph } from "@/lib/prereq-graph";
import { PrereqGraphView } from "@/components/paths/prereq-graph-view";

export const metadata: Metadata = {
  title: "Prerequisite Paths",
  description: "See how each discipline's courses build on one another, prerequisite by prerequisite.",
};

const DISCIPLINE_ORDER = [
  "first-year",
  "chemical",
  "civil",
  "electrical",
  "integrated",
  "mechanical",
  "mechatronics",
  "software",
  "aise",
  "biomedical",
];

export default async function PathsPage({ searchParams }: PageProps<"/paths">) {
  const raw = await searchParams;
  const rawSlug = Array.isArray(raw.discipline) ? raw.discipline[0] : raw.discipline;

  const [courses, disciplines] = await Promise.all([
    prisma.course.findMany({
      select: {
        id: true,
        code: true,
        title: true,
        yearLevel: true,
        prerequisites: true,
        disciplineId: true,
        discipline: { select: { name: true, slug: true, colorAccent: true } },
      },
    }),
    prisma.discipline.findMany({ select: { slug: true, name: true, colorAccent: true } }),
  ]);

  const orderedDisciplines = [...disciplines].sort(
    (a, b) => DISCIPLINE_ORDER.indexOf(a.slug) - DISCIPLINE_ORDER.indexOf(b.slug),
  );

  const selectedSlug =
    rawSlug && orderedDisciplines.some((d) => d.slug === rawSlug)
      ? rawSlug
      : (orderedDisciplines.find((d) => d.slug !== "first-year")?.slug ?? orderedDisciplines[0]?.slug ?? "");

  const graphInput = courses.map((c) => ({
    id: c.id,
    code: c.code,
    title: c.title,
    yearLevel: c.yearLevel,
    prerequisites: c.prerequisites,
    disciplineId: c.disciplineId,
    disciplineName: c.discipline?.name ?? null,
    disciplineSlug: c.discipline?.slug ?? null,
  }));

  const graph = buildPrereqGraph(graphInput);
  const { nodeIds, edges } = selectDisciplineSubgraph(graph, selectedSlug);
  const columns = computeLayoutColumns(nodeIds, edges);

  const disciplineBySlug = new Map(disciplines.map((d) => [d.slug, d]));
  const nodes = [...nodeIds].map((id) => {
    const node = graph.nodes.get(id)!;
    const discipline = node.disciplineSlug ? disciplineBySlug.get(node.disciplineSlug) : undefined;
    return {
      id: node.id,
      code: node.code,
      title: node.title,
      yearLevel: node.yearLevel,
      prerequisitesText: node.prerequisitesText,
      disciplineSlug: node.disciplineSlug,
      disciplineName: node.disciplineName,
      colorAccent: discipline?.colorAccent ?? "#64748B",
      isExternal: node.disciplineSlug !== selectedSlug,
      column: columns.get(id) ?? 0,
    };
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <h1 className="mb-1 text-2xl font-semibold">Prerequisite Paths</h1>
      <p className="mb-6 max-w-2xl text-sm text-text-muted">
        How a discipline&rsquo;s courses build on each other, drawn from the same prerequisite
        text shown on every course page. Only prerequisites that resolve to a real course in the
        catalog are drawn — click any course for its full prerequisite text.
      </p>
      <PrereqGraphView disciplines={orderedDisciplines} selectedSlug={selectedSlug} nodes={nodes} edges={edges} />
    </main>
  );
}
