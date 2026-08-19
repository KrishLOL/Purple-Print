"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isWithinEditWindow, recomputeCourseAggregates, recomputeProfessorAggregates } from "@/lib/ratings";

export async function updateMyReview(reviewId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || review.userId !== session.user.id) {
    throw new Error("Review not found.");
  }
  if (!isWithinEditWindow(review.createdAt)) {
    throw new Error("This review is more than 30 days old and can no longer be edited.");
  }

  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 30 || body.length > 2000) {
    throw new Error("Review body must be between 30 and 2000 characters.");
  }
  const useful = Number(formData.get("useful"));
  const easy = Number(formData.get("easy"));
  const workloadHours = Number(formData.get("workloadHours"));
  const liked = formData.get("liked") === "true";

  await prisma.$transaction(async (tx) => {
    await tx.review.update({
      where: { id: reviewId },
      data: { body, useful, easy, workloadHours, liked, editedAt: new Date() },
    });
    await recomputeCourseAggregates(tx, review.courseId);
    if (review.professorId) {
      await recomputeProfessorAggregates(tx, review.professorId);
    }
  });

  redirect("/me");
}
