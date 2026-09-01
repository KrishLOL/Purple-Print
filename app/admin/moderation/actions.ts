"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { recomputeCourseAggregates, recomputeProfessorAggregates } from "@/lib/ratings";
import { logModerationAction } from "@/lib/mod-log";
import { normalizeProfessorName, slugifyProfessorName } from "@/lib/professor-suggestions";

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

export async function promoteProfessorSuggestion(suggestionId: string, formData: FormData) {
  const actor = await requireMod();

  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || "Professor";
  if (!firstName || !lastName) {
    throw new Error("First and last name are required to promote a suggestion.");
  }

  await prisma.$transaction(async (tx) => {
    const suggestion = await tx.professorSuggestion.findUniqueOrThrow({ where: { id: suggestionId } });
    if (suggestion.status !== "OPEN") return;

    // If this looks like an existing professor just not yet linked to this
    // course (their course-linkage in the catalog being incomplete is more
    // common than a genuinely new hire), link them instead of creating a
    // duplicate Professor row.
    let professor = await tx.professor.findFirst({
      where: {
        firstName: { equals: firstName, mode: "insensitive" },
        lastName: { equals: lastName, mode: "insensitive" },
      },
    });

    let action: string;
    if (professor) {
      action = "LINK_EXISTING_PROFESSOR";
    } else {
      const course = await tx.course.findUniqueOrThrow({ where: { id: suggestion.courseId } });
      const baseSlug = slugifyProfessorName(firstName, lastName);
      let slug = baseSlug;
      let n = 2;
      while (await tx.professor.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${n}`;
        n++;
      }
      professor = await tx.professor.create({
        data: { firstName, lastName, slug, title, disciplineId: course.disciplineId },
      });
      action = "CREATE_PROFESSOR";
    }

    await tx.courseProfessor.upsert({
      where: { courseId_professorId: { courseId: suggestion.courseId, professorId: professor.id } },
      create: { courseId: suggestion.courseId, professorId: professor.id },
      update: {},
    });

    // Backfill: reviews on this course that named this professor via free
    // text before a real Professor record existed for them get linked now,
    // so their history counts toward the professor's aggregates.
    const candidates = await tx.review.findMany({
      where: { courseId: suggestion.courseId, professorId: null, suggestedProfessorName: { not: null } },
      select: { id: true, suggestedProfessorName: true },
    });
    const matchingIds = candidates
      .filter((r) => normalizeProfessorName(r.suggestedProfessorName!) === suggestion.normalizedName)
      .map((r) => r.id);
    if (matchingIds.length > 0) {
      await tx.review.updateMany({ where: { id: { in: matchingIds } }, data: { professorId: professor.id } });
    }

    await tx.professorSuggestion.update({ where: { id: suggestionId }, data: { status: "PROMOTED" } });
    await recomputeProfessorAggregates(tx, professor.id);

    await logModerationAction(tx, {
      actorId: actor.id,
      action,
      targetType: "Professor",
      targetId: professor.id,
      reason: `Promoted suggestion "${suggestion.displayName}" (${suggestion.mentionCount} mentions) on course ${suggestion.courseId}`,
    });
  });

  revalidatePath("/admin/moderation");
}

export async function dismissProfessorSuggestion(suggestionId: string) {
  const actor = await requireMod();
  await prisma.$transaction(async (tx) => {
    await tx.professorSuggestion.update({ where: { id: suggestionId }, data: { status: "DISMISSED" } });
    await logModerationAction(tx, {
      actorId: actor.id,
      action: "DISMISS_SUGGESTION",
      targetType: "ProfessorSuggestion",
      targetId: suggestionId,
      reason: "Dismissed by moderator",
    });
  });
  revalidatePath("/admin/moderation");
}
