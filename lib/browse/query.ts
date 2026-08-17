import { prisma } from "@/lib/db";
import { bayesianAverage, displayRating, MIN_REVIEWS_FOR_RATING } from "@/lib/ratings";
import type { BrowseParams, CourseSortKey, ProfessorSortKey, SortDir } from "./params";
import { COURSE_RATING_SORT_KEYS, PROFESSOR_RATING_SORT_KEYS } from "./params";

export type CourseRow = {
  id: string;
  code: string;
  title: string;
  disciplineSlug: string | null;
  disciplineName: string | null;
  disciplineColor: string | null;
  disciplineGlyph: string | null;
  yearLevel: number;
  termsOffered: string[];
  isCore: boolean;
  reviewCount: number;
  useful: number | null;
  easy: number | null;
  liked: number | null;
  workload: number;
};

export type ProfessorRow = {
  id: string;
  slug: string;
  firstName: string;
  lastName: string;
  title: string;
  disciplineSlug: string | null;
  disciplineName: string | null;
  disciplineColor: string | null;
  disciplineGlyph: string | null;
  reviewCount: number;
  clarity: number | null;
  helpfulness: number | null;
  retake: number | null;
};

/** avgUseful/avgEasy are stored as meanToPercent(mean) — this inverts it back to a 1-5 mean. */
function percentToRawMean(percent: number): number {
  return (percent / 100) * 4 + 1;
}

function percentToRawSum(percent: number, count: number): number {
  return percentToRawMean(percent) * count;
}

function directionMultiplier(dir: SortDir): 1 | -1 {
  return dir === "asc" ? 1 : -1;
}

/**
 * Sorts rows by a rating column using a Bayesian average against the
 * site-wide mean for that metric, with under-threshold rows always pinned
 * to the bottom regardless of sort direction (per the brief: "sort to the
 * bottom by default"). Non-rating columns (code, title, reviewCount,
 * workload, lastName) just compare directly.
 */
function sortRows<Row extends { reviewCount: number }>(
  rows: Row[],
  rawPercent: (row: Row) => number | undefined,
  globalMean: number,
  isRatingSort: boolean,
  compareOther: (a: Row, b: Row) => number,
  dir: SortDir,
): Row[] {
  const mult = directionMultiplier(dir);

  if (!isRatingSort) {
    return [...rows].sort((a, b) => mult * compareOther(a, b));
  }

  return [...rows].sort((a, b) => {
    const aEnough = a.reviewCount >= MIN_REVIEWS_FOR_RATING;
    const bEnough = b.reviewCount >= MIN_REVIEWS_FOR_RATING;
    if (aEnough !== bEnough) return aEnough ? -1 : 1; // enough-review rows always sort above thin ones

    if (!aEnough && !bEnough) return 0; // both "not enough ratings" — order doesn't matter

    const aScore = bayesianAverage({
      sum: (rawPercent(a) ?? 0) * a.reviewCount,
      n: a.reviewCount,
      globalMean,
    });
    const bScore = bayesianAverage({
      sum: (rawPercent(b) ?? 0) * b.reviewCount,
      n: b.reviewCount,
      globalMean,
    });
    return mult * (aScore - bScore);
  });
}

export async function getCourseRows(params: BrowseParams): Promise<CourseRow[]> {
  const courses = await prisma.course.findMany({
    where: {
      ...(params.q
        ? {
            OR: [
              { code: { contains: params.q, mode: "insensitive" as const } },
              { title: { contains: params.q, mode: "insensitive" as const } },
              { description: { contains: params.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(params.discipline.length > 0
        ? { discipline: { slug: { in: params.discipline } } }
        : {}),
      ...(params.year.length > 0 ? { yearLevel: { in: params.year } } : {}),
      ...(params.term.length > 0 ? { termsOffered: { hasSome: params.term } } : {}),
      ...(params.type === "core" ? { isCore: true } : {}),
      ...(params.type === "elective" ? { isCore: false } : {}),
      ...(params.minReviews > 0 ? { reviewCount: { gte: params.minReviews } } : {}),
    },
    include: { discipline: true },
  });

  const totals = courses.reduce(
    (acc, c) => {
      acc.usefulSum += percentToRawSum(c.avgUseful, c.reviewCount);
      acc.easySum += percentToRawSum(c.avgEasy, c.reviewCount);
      acc.likedSum += c.avgLiked * c.reviewCount; // avgLiked is already a 0-100 percent
      acc.count += c.reviewCount;
      return acc;
    },
    { usefulSum: 0, easySum: 0, likedSum: 0, count: 0 },
  );
  const globalMeanRawUseful = totals.count > 0 ? totals.usefulSum / totals.count : 3;
  const globalMeanRawEasy = totals.count > 0 ? totals.easySum / totals.count : 3;
  const globalMeanPctLiked = totals.count > 0 ? totals.likedSum / totals.count : 50;

  type Internal = CourseRow & { _rawUseful: number; _rawEasy: number; _rawLiked: number };

  const rows: Internal[] = courses.map((c) => ({
    id: c.id,
    code: c.code,
    title: c.title,
    disciplineSlug: c.discipline?.slug ?? null,
    disciplineName: c.discipline?.name ?? null,
    disciplineColor: c.discipline?.colorAccent ?? null,
    disciplineGlyph: c.discipline?.glyphKey ?? null,
    yearLevel: c.yearLevel,
    termsOffered: c.termsOffered,
    isCore: c.isCore,
    reviewCount: c.reviewCount,
    useful: displayRating(c.avgUseful, c.reviewCount),
    easy: displayRating(c.avgEasy, c.reviewCount),
    liked: displayRating(c.avgLiked, c.reviewCount),
    workload: c.avgWorkload,
    // per-review raw score (1-5 mean for useful/easy, 0-100 percent for liked) — sortRows
    // multiplies this back out by reviewCount to reconstruct the Bayesian sum.
    _rawUseful: percentToRawMean(c.avgUseful),
    _rawEasy: percentToRawMean(c.avgEasy),
    _rawLiked: c.avgLiked,
  }));

  const sort = params.sort as CourseSortKey;
  const isRating = (COURSE_RATING_SORT_KEYS as string[]).includes(sort);
  const rawGetter =
    sort === "useful"
      ? (r: Internal) => r._rawUseful
      : sort === "easy"
        ? (r: Internal) => r._rawEasy
        : (r: Internal) => r._rawLiked;
  const globalMean =
    sort === "useful" ? globalMeanRawUseful : sort === "easy" ? globalMeanRawEasy : globalMeanPctLiked;

  const compareOther = (a: Internal, b: Internal) => {
    switch (sort) {
      case "code":
        return a.code.localeCompare(b.code);
      case "title":
        return a.title.localeCompare(b.title);
      case "reviewCount":
        return a.reviewCount - b.reviewCount;
      case "workload":
        return a.workload - b.workload;
      default:
        return 0;
    }
  };

  return sortRows(rows, rawGetter, globalMean, isRating, compareOther, params.dir);
}

export async function getProfessorRows(params: BrowseParams): Promise<ProfessorRow[]> {
  const professors = await prisma.professor.findMany({
    where: {
      ...(params.q
        ? {
            OR: [
              { firstName: { contains: params.q, mode: "insensitive" as const } },
              { lastName: { contains: params.q, mode: "insensitive" as const } },
              { title: { contains: params.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
      ...(params.discipline.length > 0
        ? { discipline: { slug: { in: params.discipline } } }
        : {}),
      ...(params.minReviews > 0 ? { reviewCount: { gte: params.minReviews } } : {}),
    },
    include: { discipline: true },
  });

  const totals = professors.reduce(
    (acc, p) => {
      acc.claritySum += percentToRawSum(p.avgClarity, p.reviewCount);
      acc.helpfulnessSum += percentToRawSum(p.avgHelpfulness, p.reviewCount);
      acc.retakeSum += p.avgRetakePct * p.reviewCount;
      acc.count += p.reviewCount;
      return acc;
    },
    { claritySum: 0, helpfulnessSum: 0, retakeSum: 0, count: 0 },
  );
  const globalMeanRawClarity = totals.count > 0 ? totals.claritySum / totals.count : 3;
  const globalMeanRawHelpfulness = totals.count > 0 ? totals.helpfulnessSum / totals.count : 3;
  const globalMeanPctRetake = totals.count > 0 ? totals.retakeSum / totals.count : 50;

  type Internal = ProfessorRow & { _rawClarity: number; _rawHelpfulness: number; _rawRetake: number };

  const rows: Internal[] = professors.map((p) => ({
    id: p.id,
    slug: p.slug,
    firstName: p.firstName,
    lastName: p.lastName,
    title: p.title,
    disciplineSlug: p.discipline?.slug ?? null,
    disciplineName: p.discipline?.name ?? null,
    disciplineColor: p.discipline?.colorAccent ?? null,
    disciplineGlyph: p.discipline?.glyphKey ?? null,
    reviewCount: p.reviewCount,
    clarity: displayRating(p.avgClarity, p.reviewCount),
    helpfulness: displayRating(p.avgHelpfulness, p.reviewCount),
    retake: displayRating(p.avgRetakePct, p.reviewCount),
    _rawClarity: percentToRawMean(p.avgClarity),
    _rawHelpfulness: percentToRawMean(p.avgHelpfulness),
    _rawRetake: p.avgRetakePct,
  }));

  const sort = params.sort as ProfessorSortKey;
  const isRating = (PROFESSOR_RATING_SORT_KEYS as string[]).includes(sort);
  const rawGetter =
    sort === "clarity"
      ? (r: Internal) => r._rawClarity
      : sort === "helpfulness"
        ? (r: Internal) => r._rawHelpfulness
        : (r: Internal) => r._rawRetake;
  const globalMean =
    sort === "clarity"
      ? globalMeanRawClarity
      : sort === "helpfulness"
        ? globalMeanRawHelpfulness
        : globalMeanPctRetake;

  const compareOther = (a: Internal, b: Internal) => {
    switch (sort) {
      case "lastName":
        return a.lastName.localeCompare(b.lastName);
      case "reviewCount":
        return a.reviewCount - b.reviewCount;
      default:
        return 0;
    }
  };

  return sortRows(rows, rawGetter, globalMean, isRating, compareOther, params.dir);
}
