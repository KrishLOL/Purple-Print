import { prisma } from "@/lib/db";
import { booleanPercent, displayRating, meanToPercent } from "@/lib/ratings";
import { formatAuthorLabel } from "@/lib/anonymize";
import { bucketGrades, bucketWorkload } from "@/lib/review-stats";
import type { ReviewCardData } from "@/components/review-card";

export type ProfessorForCourse = {
  slug: string;
  firstName: string;
  lastName: string;
  title: string;
  reviewCountForCourse: number;
  clarity: number | null;
  helpfulness: number | null;
  retake: number | null;
};

export async function getCourseDetail(code: string) {
  const course = await prisma.course.findUnique({
    where: { code },
    include: {
      discipline: true,
      professors: { include: { professor: true } },
    },
  });
  if (!course) return null;

  const reviews = await prisma.review.findMany({
    where: { courseId: course.id, status: "PUBLISHED" },
    include: { user: { include: { discipline: true } }, professor: true },
    orderBy: { createdAt: "desc" },
  });

  const professorCards: ProfessorForCourse[] = course.professors.map(({ professor }) => {
    const profReviews = reviews.filter((r) => r.professorId === professor.id);
    const clarityValues = profReviews.map((r) => r.clarity).filter((v): v is number => v != null);
    const helpfulnessValues = profReviews
      .map((r) => r.helpfulness)
      .filter((v): v is number => v != null);
    const retakeValues = profReviews.map((r) => r.wouldRetake).filter((v): v is boolean => v != null);
    const reviewCountForCourse = profReviews.length;

    return {
      slug: professor.slug,
      firstName: professor.firstName,
      lastName: professor.lastName,
      title: professor.title,
      reviewCountForCourse,
      clarity: displayRating(
        clarityValues.length ? meanToPercent(avg(clarityValues)) : 0,
        reviewCountForCourse,
      ),
      helpfulness: displayRating(
        helpfulnessValues.length ? meanToPercent(avg(helpfulnessValues)) : 0,
        reviewCountForCourse,
      ),
      retake: displayRating(booleanPercent(retakeValues.filter(Boolean).length, retakeValues.length), reviewCountForCourse),
    };
  });

  const reviewCards: ReviewCardData[] = reviews.map((r) => ({
    id: r.id,
    authorLabel: formatAuthorLabel(r.user.discipline?.name, r.user.gradYear),
    termTaken: r.termTaken,
    yearTaken: r.yearTaken,
    gradeReceived: r.gradeReceived,
    useful: r.useful,
    easy: r.easy,
    liked: r.liked,
    workloadHours: r.workloadHours,
    clarity: r.clarity,
    helpfulness: r.helpfulness,
    wouldRetake: r.wouldRetake,
    body: r.body,
    helpfulCount: r.helpfulCount,
    createdAt: r.createdAt.toISOString(),
    professorLabel: r.professor
      ? `${r.professor.firstName} ${r.professor.lastName}`
      : r.suggestedProfessorName
        ? `${r.suggestedProfessorName} (unconfirmed)`
        : null,
  }));

  return {
    course,
    professorCards,
    reviewCards,
    workloadBuckets: bucketWorkload(reviews.map((r) => r.workloadHours)),
    gradeBuckets: bucketGrades(reviews.map((r) => r.gradeReceived)),
    useful: displayRating(course.avgUseful, course.reviewCount),
    easy: displayRating(course.avgEasy, course.reviewCount),
    liked: displayRating(course.avgLiked, course.reviewCount),
  };
}

function avg(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}
