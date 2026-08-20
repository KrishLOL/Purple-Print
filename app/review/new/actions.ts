"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { recomputeCourseAggregates, recomputeProfessorAggregates } from "@/lib/ratings";
import { reviewFormSchema, type ReviewFormValues } from "@/lib/review-schema";
import { screenReview } from "@/lib/moderation";
import { logModerationAction } from "@/lib/mod-log";

const MAX_REVIEWS_PER_DAY = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

export type SubmitReviewResult = { ok: true } | { ok: false; error: string };

export async function submitReview(values: ReviewFormValues): Promise<SubmitReviewResult> {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.isBanned) return { ok: false, error: "This account is suspended." };

  const parsed = reviewFormSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "That review isn't valid." };
  }
  const data = parsed.data;

  const userId = session.user.id;

  const recentCount = await prisma.review.count({
    where: { userId, createdAt: { gte: new Date(Date.now() - DAY_MS) } },
  });
  if (recentCount >= MAX_REVIEWS_PER_DAY) {
    return { ok: false, error: `You've hit the limit of ${MAX_REVIEWS_PER_DAY} reviews per day. Try again tomorrow.` };
  }

  const allProfessors = await prisma.professor.findMany({
    select: { firstName: true, lastName: true },
  });
  const professorNames = allProfessors.flatMap((p) => [
    `${p.firstName} ${p.lastName}`,
    p.lastName,
  ]);
  const verdict = screenReview(data.body, professorNames);

  try {
    await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId,
          courseId: data.courseId,
          professorId: data.professorId,
          termTaken: data.termTaken,
          yearTaken: data.yearTaken,
          useful: data.useful,
          easy: data.easy,
          liked: data.liked,
          workloadHours: data.workloadHours,
          clarity: data.clarity,
          helpfulness: data.helpfulness,
          wouldRetake: data.wouldRetake,
          gradeReceived: data.gradeReceived,
          body: data.body,
          status: verdict.status,
        },
      });

      if (verdict.status === "PENDING") {
        await logModerationAction(tx, {
          actorId: userId,
          action: "AUTO_HOLD",
          targetType: "Review",
          targetId: review.id,
          reason: verdict.reasons.join("; "),
        });
      }

      // Aggregates only ever count PUBLISHED reviews (see lib/ratings.ts),
      // so this is a no-op when the review lands PENDING — still safe and
      // correct to call unconditionally.
      await recomputeCourseAggregates(tx, data.courseId);
      if (data.professorId) {
        await recomputeProfessorAggregates(tx, data.professorId);
      }
    });
  } catch (err: unknown) {
    if (typeof err === "object" && err && "code" in err && err.code === "P2002") {
      return { ok: false, error: "You've already reviewed this course." };
    }
    throw err;
  }

  return { ok: true };
}
