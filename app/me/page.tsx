import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/db";
import { isWithinEditWindow } from "@/lib/ratings";
import { Button } from "@/components/ui/button";
import { DeleteReviewButton } from "@/components/me/delete-review-button";
import { UnsaveCourseButton } from "@/components/me/unsave-course-button";
import { ProfileForm } from "@/components/me/profile-form";

export const metadata: Metadata = { title: "My account" };

export default async function MePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const [user, reviews, savedCourses, disciplines] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    prisma.review.findMany({
      where: { userId: session.user.id },
      include: { course: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.savedCourse.findMany({
      where: { userId: session.user.id },
      include: { course: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.discipline.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
      <header className="mb-8 flex items-center justify-between border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-semibold">My account</h1>
          <p className="font-num mt-1 text-sm text-text-muted">{user.email}</p>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </header>

      <section className="border-b border-border py-8">
        <h2 className="mb-4 text-xs uppercase tracking-wider text-text-muted">Profile</h2>
        <ProfileForm
          disciplines={disciplines}
          currentDisciplineId={user.disciplineId}
          currentGradYear={user.gradYear}
        />
      </section>

      <section className="border-b border-border py-8">
        <h2 className="mb-4 text-xs uppercase tracking-wider text-text-muted">
          Saved courses ({savedCourses.length})
        </h2>
        {savedCourses.length === 0 ? (
          <p className="text-sm text-text-muted">No saved courses yet.</p>
        ) : (
          <ul className="space-y-2">
            {savedCourses.map((s) => (
              <li key={s.id} className="flex items-center justify-between border border-border bg-surface px-3 py-2">
                <Link
                  href={`/course/${encodeURIComponent(s.course.code)}`}
                  className="font-num text-sm hover:text-accent"
                >
                  {s.course.code} — {s.course.title}
                </Link>
                <UnsaveCourseButton courseId={s.courseId} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="py-8">
        <h2 className="mb-4 text-xs uppercase tracking-wider text-text-muted">
          Your reviews ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-text-muted">You haven&rsquo;t written any reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => {
              const editable = isWithinEditWindow(r.createdAt);
              return (
                <div key={r.id} className="border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Link
                        href={`/course/${encodeURIComponent(r.course.code)}`}
                        className="font-num text-sm hover:text-accent"
                      >
                        {r.course.code} — {r.course.title}
                      </Link>
                      <p className="font-num mt-0.5 text-xs text-text-muted">
                        {r.status === "PUBLISHED" ? "Published" : r.status === "PENDING" ? "Pending review" : "Removed"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      {editable && (
                        <Link
                          href={`/me/reviews/${r.id}/edit`}
                          className="text-xs text-accent underline underline-offset-4"
                        >
                          Edit
                        </Link>
                      )}
                      <DeleteReviewButton reviewId={r.id} />
                    </div>
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-text-muted">{r.body}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
