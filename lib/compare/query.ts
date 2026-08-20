import { prisma } from "@/lib/db";
import { displayRating } from "@/lib/ratings";

export type CompareCourseRow = {
  id: string;
  code: string;
  title: string;
  reviewCount: number;
  useful: number | null;
  easy: number | null;
  liked: number | null;
  workload: number;
};

export type CompareProfessorRow = {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  reviewCount: number;
  clarity: number | null;
  helpfulness: number | null;
  retake: number | null;
};

/** Keeps rows in the same order as `ids` (selection order), not DB order. */
function reorder<T extends { id: string }>(ids: string[], rows: T[]): T[] {
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter((r): r is T => Boolean(r));
}

export async function getCompareCourses(ids: string[]): Promise<CompareCourseRow[]> {
  if (ids.length === 0) return [];
  const courses = await prisma.course.findMany({ where: { id: { in: ids } } });
  return reorder(
    ids,
    courses.map((c) => ({
      id: c.id,
      code: c.code,
      title: c.title,
      reviewCount: c.reviewCount,
      useful: displayRating(c.avgUseful, c.reviewCount),
      easy: displayRating(c.avgEasy, c.reviewCount),
      liked: displayRating(c.avgLiked, c.reviewCount),
      workload: c.avgWorkload,
    })),
  );
}

export async function getCompareProfessors(ids: string[]): Promise<CompareProfessorRow[]> {
  if (ids.length === 0) return [];
  const professors = await prisma.professor.findMany({ where: { id: { in: ids } } });
  return reorder(
    ids,
    professors.map((p) => ({
      id: p.id,
      slug: p.slug,
      firstName: p.firstName,
      lastName: p.lastName,
      reviewCount: p.reviewCount,
      clarity: displayRating(p.avgClarity, p.reviewCount),
      helpfulness: displayRating(p.avgHelpfulness, p.reviewCount),
      retake: displayRating(p.avgRetakePct, p.reviewCount),
    })),
  );
}
