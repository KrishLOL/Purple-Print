"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { recomputeCourseAggregates, recomputeProfessorAggregates } from "@/lib/ratings";
import { logModerationAction } from "@/lib/mod-log";
import type { ReportReason } from "@/app/generated/prisma/client";

const AUTO_HIDE_THRESHOLD = 3;

export type ReportReviewResult = { ok: true } | { ok: false; error: string };

export async function reportReview(
  reviewId: string,
  reason: ReportReason,
  details: string,
): Promise<ReportReviewResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Sign in to report a review." };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.reviewReport.create({
        data: { reviewId, userId: session.user.id, reason, details: details.trim() || null },
      });

      const reportCount = await tx.reviewReport.count({ where: { reviewId } });
      const review = await tx.review.findUniqueOrThrow({ where: { id: reviewId } });
      const shouldAutoHide = reportCount >= AUTO_HIDE_THRESHOLD && review.status === "PUBLISHED";

      await tx.review.update({
        where: { id: reviewId },
        data: { reportCount, ...(shouldAutoHide ? { status: "PENDING" } : {}) },
      });

      if (shouldAutoHide) {
        await logModerationAction(tx, {
          actorId: session.user.id,
          action: "AUTO_HIDE_REPORTS",
          targetType: "Review",
          targetId: reviewId,
          reason: `Reached ${reportCount} reports`,
        });
        await recomputeCourseAggregates(tx, review.courseId);
        if (review.professorId) {
          await recomputeProfessorAggregates(tx, review.professorId);
        }
      }
    });
  } catch (err: unknown) {
    if (typeof err === "object" && err && "code" in err && err.code === "P2002") {
      return { ok: false, error: "You've already reported this review." };
    }
    throw err;
  }

  return { ok: true };
}
