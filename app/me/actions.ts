"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { recomputeCourseAggregates, recomputeProfessorAggregates } from "@/lib/ratings";

export async function deleteMyReview(reviewId: string) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review || review.userId !== session.user.id) {
    throw new Error("Review not found.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: reviewId } });
    await recomputeCourseAggregates(tx, review.courseId);
    if (review.professorId) {
      await recomputeProfessorAggregates(tx, review.professorId);
    }
  });

  revalidatePath("/me");
}

export async function updateMyProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const disciplineId = formData.get("disciplineId");
  const gradYear = formData.get("gradYear");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      disciplineId: typeof disciplineId === "string" && disciplineId ? disciplineId : null,
      gradYear: typeof gradYear === "string" && gradYear ? Number.parseInt(gradYear, 10) : null,
    },
  });

  revalidatePath("/me");
}

export async function unsaveCourse(courseId: string) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  await prisma.savedCourse.deleteMany({ where: { userId: session.user.id, courseId } });
  revalidatePath("/me");
}
