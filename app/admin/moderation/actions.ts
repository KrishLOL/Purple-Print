"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { recomputeCourseAggregates, recomputeProfessorAggregates } from "@/lib/ratings";
import { logModerationAction } from "@/lib/mod-log";

async function requireMod() {
  const session = await auth();
  if (!session?.user || session.user.role === "STUDENT") {
    throw new Error("Not authorized.");
  }
  return session.user;
}

export async function approveReview(reviewId: string) {
  const actor = await requireMod();
  await prisma.$transaction(async (tx) => {
    const review = await tx.review.update({ where: { id: reviewId }, data: { status: "PUBLISHED" } });
    await recomputeCourseAggregates(tx, review.courseId);
    if (review.professorId) await recomputeProfessorAggregates(tx, review.professorId);
    await logModerationAction(tx, {
      actorId: actor.id,
      action: "APPROVE",
      targetType: "Review",
      targetId: reviewId,
      reason: "Approved by moderator",
    });
  });
  revalidatePath("/admin/moderation");
}

export async function removeReview(reviewId: string) {
  const actor = await requireMod();
  await prisma.$transaction(async (tx) => {
    const review = await tx.review.update({ where: { id: reviewId }, data: { status: "REMOVED" } });
    await recomputeCourseAggregates(tx, review.courseId);
    if (review.professorId) await recomputeProfessorAggregates(tx, review.professorId);
    await logModerationAction(tx, {
      actorId: actor.id,
      action: "REMOVE",
      targetType: "Review",
      targetId: reviewId,
      reason: "Removed by moderator",
    });
  });
  revalidatePath("/admin/moderation");
}

export async function banReviewAuthor(userId: string) {
  const actor = await requireMod();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { isBanned: true } });
    await logModerationAction(tx, {
      actorId: actor.id,
      action: "BAN",
      targetType: "User",
      targetId: userId,
      reason: "Banned by moderator from the mod queue",
    });
  });
  revalidatePath("/admin/moderation");
}

export async function unbanUser(userId: string) {
  const actor = await requireMod();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { isBanned: false } });
    await logModerationAction(tx, {
      actorId: actor.id,
      action: "UNBAN",
      targetType: "User",
      targetId: userId,
      reason: "Unbanned by moderator",
    });
  });
  revalidatePath("/admin/moderation");
}
