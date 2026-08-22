import { prisma } from "@/lib/db";
import { bayesianAverage, MIN_REVIEWS_FOR_RATING } from "@/lib/ratings";

export type DisciplineSummary = {
  slug: string;
  name: string;
  colorAccent: string;
  glyphKey: string;
  courseCount: number;
};

const CORE_DISCIPLINE_ORDER = [
  "first-year",
  "chemical",
  "civil",
  "electrical",
  "integrated",
  "mechanical",
  "mechatronics",
  "software",
];

export type TopRatedCourse = {
  code: string;
  title: string;
  useful: number;
  reviewCount: number;
};

export type RecentlyReviewedCourse = {
  code: string;
  title: string;
  reviewedAt: string;
};

export async function getLandingData() {
  const [courseCount, professorCount, reviewCount, disciplines, courses, recentReviews] =
    await Promise.all([
      prisma.course.count(),
      prisma.professor.count(),
      prisma.review.count({ where: { status: "PUBLISHED" } }),
      prisma.discipline.findMany({
        select: {
          slug: true,
          name: true,
          colorAccent: true,
          glyphKey: true,
          isCombinedDegree: true,
          _count: { select: { courses: true } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.course.findMany({
        where: { reviewCount: { gte: MIN_REVIEWS_FOR_RATING } },
        select: { code: true, title: true, avgUseful: true, reviewCount: true },
      }),
      prisma.review.findMany({
        where: { status: "PUBLISHED" },
        distinct: ["courseId"],
        orderBy: { createdAt: "desc" },
        take: 6,
        select: { createdAt: true, course: { select: { code: true, title: true } } },
      }),
    ]);

  const totalUsefulReviews = courses.reduce((sum, c) => sum + c.reviewCount, 0);
  const globalMeanRawUseful =
    totalUsefulReviews > 0
      ? courses.reduce((sum, c) => sum + ((c.avgUseful / 100) * 4 + 1) * c.reviewCount, 0) /
        totalUsefulReviews
      : 3;

  const topRated: TopRatedCourse[] = courses
    .map((c) => {
      const rawMean = (c.avgUseful / 100) * 4 + 1;
      const score = bayesianAverage({ sum: rawMean * c.reviewCount, n: c.reviewCount, globalMean: globalMeanRawUseful });
      return { code: c.code, title: c.title, useful: c.avgUseful, reviewCount: c.reviewCount, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map(({ code, title, useful, reviewCount }) => ({ code, title, useful, reviewCount }));

  const recentlyReviewed: RecentlyReviewedCourse[] = recentReviews.map((r) => ({
    code: r.course.code,
    title: r.course.title,
    reviewedAt: r.createdAt.toISOString(),
  }));

  const toSummary = (d: (typeof disciplines)[number]): DisciplineSummary => ({
    slug: d.slug,
    name: d.name,
    colorAccent: d.colorAccent,
    glyphKey: d.glyphKey,
    courseCount: d._count.courses,
  });

  const coreDisciplines = disciplines
    .filter((d) => !d.isCombinedDegree)
    .map(toSummary)
    .sort((a, b) => CORE_DISCIPLINE_ORDER.indexOf(a.slug) - CORE_DISCIPLINE_ORDER.indexOf(b.slug));

  const combinedDegreeDisciplines = disciplines.filter((d) => d.isCombinedDegree).map(toSummary);

  return {
    stats: { courseCount, professorCount, reviewCount },
    coreDisciplines,
    combinedDegreeDisciplines,
    topRated,
    recentlyReviewed,
  };
}
