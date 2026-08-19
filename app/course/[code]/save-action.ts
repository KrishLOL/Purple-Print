"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function toggleSavedCourse(courseId: string): Promise<{ saved: boolean }> {
  const session = await auth();
  if (!session?.user) throw new Error("Sign in to save courses.");

  const existing = await prisma.savedCourse.findUnique({
    where: { userId_courseId: { userId: session.user.id, courseId } },
  });

  if (existing) {
    await prisma.savedCourse.delete({ where: { id: existing.id } });
    return { saved: false };
  }

  await prisma.savedCourse.create({ data: { userId: session.user.id, courseId } });
  return { saved: true };
}
