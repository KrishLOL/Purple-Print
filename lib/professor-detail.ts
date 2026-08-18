import { prisma } from "@/lib/db";
import { booleanPercent, displayRating, meanToPercent } from "@/lib/ratings";
import { formatAuthorLabel } from "@/lib/anonymize";
import type { ReviewCardData } from "@/components/review-card";

export type CourseForProfessor = {
  code: string;
  title: string;
  reviewCountForProfessor: number;
  clarity: number | null;
  helpfulness: number | null;
  retake: number | null;
  reviews: ReviewCardData[];
};

function avg(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length;
}

export async function getProfessorDetail(slug: string) {
  const professor = await prisma.professor.findUnique({
    where: { slug },
    include: {
      discipline: true,
      courses: { include: { course: true } },
    },
  });
  if (!professor) return null;

  const reviews = await prisma.review.findMany({
    where: { professorId: professor.id, status: "PUBLISHED" },
    include: { user: { include: { discipline: true } }, course: true },
    orderBy: { createdAt: "desc" },
  });

  const coursesTaught: CourseForProfessor[] = professor.courses.map(({ course }) => {
    const courseReviews = reviews.filter((r) => r.courseId === course.id);
    const clarityValues = courseReviews.map((r) => r.clarity).filter((v): v is number => v != null);
    const helpfulnessValues = courseReviews
      .map((r) => r.helpfulness)
      .filter((v): v is number => v != null);
    const retakeValues = courseReviews.map((r) => r.wouldRetake).filter((v): v is boolean => v != null);
    const reviewCountForProfessor = courseReviews.length;

    return {
      code: course.code,
      title: course.title,
      reviewCountForProfessor,
      clarity: displayRating(
        clarityValues.length ? meanToPercent(avg(clarityValues)) : 0,
        reviewCountForProfessor,
      ),
      helpfulness: displayRating(
        helpfulnessValues.length ? meanToPercent(avg(helpfulnessValues)) : 0,
        reviewCountForProfessor,
      ),
      retake: displayRating(
        booleanPercent(retakeValues.filter(Boolean).length, retakeValues.length),
        reviewCountForProfessor,
      ),
      reviews: courseReviews.map((r) => ({
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
        courseLabel: r.course.code,
      })),
    };
  });

  return {
    professor,
    coursesTaught,
    clarity: displayRating(professor.avgClarity, professor.reviewCount),
    helpfulness: displayRating(professor.avgHelpfulness, professor.reviewCount),
    retake: displayRating(professor.avgRetakePct, professor.reviewCount),
  };
}
