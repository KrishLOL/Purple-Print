import type { Prisma } from "@/app/generated/prisma/client";

/**
 * Courses/professors with fewer reviews than this show "Not enough ratings"
 * instead of a number, and sort to the bottom by default.
 */
export const MIN_REVIEWS_FOR_RATING = 3;

/**
 * Bayesian-average smoothing constant. Treats every course/professor as if
 * it already had `BAYESIAN_C` reviews at the global mean before its real
 * reviews are counted, so a single 5-star review can't outrank something
 * with genuine sample size. 5 was picked as roughly "one section's worth"
 * of reviews — enough to meaningfully pull outliers toward the mean without
 * taking multiple semesters of reviews to overcome.
 */
export const BAYESIAN_C = 5;

/** Converts a 1-5 mean rating to a 0-100 percent, rounded to a whole number. */
export function meanToPercent(mean: number): number {
  return Math.round(((mean - 1) / 4) * 100);
}

/** Percent of reviews where a boolean flag (liked, wouldRetake) was true. */
export function booleanPercent(trueCount: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((trueCount / total) * 100);
}

export function hasEnoughReviews(reviewCount: number): boolean {
  return reviewCount >= MIN_REVIEWS_FOR_RATING;
}

/** Reviews can be edited for 30 days after creation, deleted any time after. */
export const REVIEW_EDIT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export function isWithinEditWindow(createdAt: Date): boolean {
  return Date.now() - createdAt.getTime() <= REVIEW_EDIT_WINDOW_MS;
}

/**
 * Returns `value` when there's enough sample size to trust it, otherwise
 * `null` — the UI renders `null` as "Not enough ratings".
 */
export function displayRating<T>(value: T, reviewCount: number): T | null {
  return hasEnoughReviews(reviewCount) ? value : null;
}

/**
 * Bayesian average for ranking: (C * globalMean + sum) / (C + n).
 * `sum` is the sum of the raw per-review scores for this item (not the
 * already-averaged percent), `n` is how many of those reviews there are,
 * and `globalMean` is the mean of that same raw metric across every
 * review site-wide. See BAYESIAN_C for why the constant is 5.
 */
export function bayesianAverage({
  sum,
  n,
  globalMean,
  c = BAYESIAN_C,
}: {
  sum: number;
  n: number;
  globalMean: number;
  c?: number;
}): number {
  return (c * globalMean + sum) / (c + n);
}

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** meanToPercent assumes a 1-5 input; guard the empty case so it doesn't return -25%. */
function percentOrZero(values: number[]): number {
  return values.length === 0 ? 0 : meanToPercent(mean(values));
}

type Tx = Prisma.TransactionClient;

/**
 * Recomputes and persists a course's denormalized aggregates from its
 * PUBLISHED reviews. Call inside the same transaction as the review write
 * that triggered it — there is no cron job / background recompute.
 */
export async function recomputeCourseAggregates(tx: Tx, courseId: string): Promise<void> {
  const reviews = await tx.review.findMany({
    where: { courseId, status: "PUBLISHED" },
    select: { useful: true, easy: true, liked: true, workloadHours: true },
  });

  const reviewCount = reviews.length;
  const avgUseful = percentOrZero(reviews.map((r) => r.useful));
  const avgEasy = percentOrZero(reviews.map((r) => r.easy));
  const avgLiked = booleanPercent(reviews.filter((r) => r.liked).length, reviewCount);
  const avgWorkload = mean(reviews.map((r) => r.workloadHours));

  await tx.course.update({
    where: { id: courseId },
    data: { reviewCount, avgUseful, avgEasy, avgLiked, avgWorkload },
  });
}

/**
 * Same as recomputeCourseAggregates, but for a professor. Only reviews that
 * named this professor and carry professor-specific ratings (clarity,
 * helpfulness, wouldRetake) count. avgRating is the professor's headline
 * number — the mean of avgClarity and avgHelpfulness — used as the default
 * sort key on /browse and in the Bayesian ranking.
 */
export async function recomputeProfessorAggregates(tx: Tx, professorId: string): Promise<void> {
  const reviews = await tx.review.findMany({
    where: { professorId, status: "PUBLISHED" },
    select: { clarity: true, helpfulness: true, wouldRetake: true },
  });

  const clarityValues = reviews.map((r) => r.clarity).filter((v): v is number => v != null);
  const helpfulnessValues = reviews
    .map((r) => r.helpfulness)
    .filter((v): v is number => v != null);
  const retakeValues = reviews.map((r) => r.wouldRetake).filter((v): v is boolean => v != null);

  const reviewCount = reviews.length;
  const avgClarity = percentOrZero(clarityValues);
  const avgHelpfulness = percentOrZero(helpfulnessValues);
  const avgRetakePct = booleanPercent(
    retakeValues.filter(Boolean).length,
    retakeValues.length,
  );
  const avgRating = Math.round((avgClarity + avgHelpfulness) / 2);

  await tx.professor.update({
    where: { id: professorId },
    data: { reviewCount, avgClarity, avgHelpfulness, avgRetakePct, avgRating },
  });
}
