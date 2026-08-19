import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { isWithinEditWindow } from "@/lib/ratings";
import { Button } from "@/components/ui/button";
import { updateMyReview } from "./actions";

export const metadata: Metadata = { title: "Edit review" };

export default async function EditReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const { id } = await params;
  const review = await prisma.review.findUnique({
    where: { id },
    include: { course: true },
  });

  if (!review || review.userId !== session.user.id) notFound();

  const editable = isWithinEditWindow(review.createdAt);
  const updateWithId = updateMyReview.bind(null, review.id);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 sm:px-8">
      <h1 className="mb-1 text-2xl font-semibold">Edit review</h1>
      <p className="mb-6 font-num text-sm text-text-muted">{review.course.code}</p>

      {!editable ? (
        <p className="border border-warn px-3 py-2 text-sm text-warn">
          This review is more than 30 days old and can no longer be edited. You can still delete it from{" "}
          <a href="/me" className="underline underline-offset-4">
            your dashboard
          </a>
          .
        </p>
      ) : (
        <form action={updateWithId} className="space-y-4">
          <div>
            <label htmlFor="body" className="mb-1.5 block text-xs uppercase tracking-wider text-text-muted">
              Review
            </label>
            <textarea
              id="body"
              name="body"
              defaultValue={review.body}
              rows={8}
              minLength={30}
              maxLength={2000}
              required
              className="w-full border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="useful" className="mb-1.5 block text-xs uppercase tracking-wider text-text-muted">
                Useful (1-5)
              </label>
              <input
                id="useful"
                name="useful"
                type="number"
                min={1}
                max={5}
                defaultValue={review.useful}
                required
                className="w-full border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="easy" className="mb-1.5 block text-xs uppercase tracking-wider text-text-muted">
                Easy (1-5)
              </label>
              <input
                id="easy"
                name="easy"
                type="number"
                min={1}
                max={5}
                defaultValue={review.easy}
                required
                className="w-full border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="workloadHours" className="mb-1.5 block text-xs uppercase tracking-wider text-text-muted">
                Workload (h/wk)
              </label>
              <input
                id="workloadHours"
                name="workloadHours"
                type="number"
                min={0}
                max={80}
                defaultValue={review.workloadHours}
                required
                className="w-full border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs uppercase tracking-wider text-text-muted">Liked</p>
            <select
              name="liked"
              defaultValue={String(review.liked)}
              className="w-full border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
            >
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>

          <Button type="submit" variant="primary">
            Save changes
          </Button>
        </form>
      )}
    </main>
  );
}
