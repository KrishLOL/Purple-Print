import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ReviewWizard } from "@/components/review/review-wizard";

export const metadata: Metadata = { title: "Write a review" };

export default async function NewReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const { course: courseCode } = await searchParams;

  const [courses, professors] = await Promise.all([
    prisma.course.findMany({
      select: { id: true, code: true, title: true },
      orderBy: { code: "asc" },
    }),
    prisma.professor.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        courses: { select: { courseId: true } },
      },
      orderBy: { lastName: "asc" },
    }),
  ]);

  const initialCourseId = courseCode
    ? (courses.find((c) => c.code === decodeURIComponent(courseCode))?.id ?? null)
    : null;

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <h1 className="mb-1 text-2xl font-semibold">Write a review</h1>
      <p className="mb-6 text-sm text-text-muted">
        Reviews are anonymous — critique the teaching, not the person. See the{" "}
        <a href="/guidelines" className="text-accent underline underline-offset-4">
          guidelines
        </a>
        .
      </p>
      <ReviewWizard
        courses={courses}
        professors={professors.map((p) => ({
          id: p.id,
          firstName: p.firstName,
          lastName: p.lastName,
          courseIds: p.courses.map((c) => c.courseId),
        }))}
        initialCourseId={initialCourseId}
      />
    </main>
  );
}
