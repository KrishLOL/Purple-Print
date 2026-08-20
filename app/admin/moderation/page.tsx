import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { ModActionButton } from "@/components/admin/mod-action-button";
import { approveReview, banReviewAuthor, removeReview, unbanUser } from "./actions";

export const metadata: Metadata = { title: "Moderation" };

export default async function ModerationPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (session.user.role === "STUDENT") {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-8">
        <h1 className="text-2xl font-semibold text-bad">Not authorized</h1>
        <p className="mt-2 text-sm text-text-muted">This page is for moderators and admins only.</p>
      </main>
    );
  }

  const [pendingReviews, bannedUsers, recentLogs] = await Promise.all([
    prisma.review.findMany({
      where: { status: "PENDING" },
      include: {
        course: true,
        professor: true,
        user: { select: { id: true, email: true, isBanned: true } },
        reports: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { isBanned: true },
      select: { id: true, email: true },
      orderBy: { email: "asc" },
    }),
    prisma.moderationLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { actor: { select: { email: true } } },
    }),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <h1 className="mb-1 text-2xl font-semibold">Moderation</h1>
      <p className="mb-8 text-sm text-text-muted">Signed in as {session.user.email} ({session.user.role})</p>

      <section className="border-b border-border py-8">
        <h2 className="mb-4 text-xs uppercase tracking-wider text-text-muted">
          Pending / reported reviews ({pendingReviews.length})
        </h2>
        {pendingReviews.length === 0 ? (
          <p className="text-sm text-text-muted">Nothing waiting on a decision.</p>
        ) : (
          <div className="space-y-4">
            {pendingReviews.map((r) => (
              <div key={r.id} className="border border-border bg-surface p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-num text-sm">
                      {r.course.code} {r.professor ? `· ${r.professor.firstName} ${r.professor.lastName}` : ""}
                    </p>
                    <p className="font-num text-xs text-text-muted">
                      {r.user.email} {r.user.isBanned && <span className="text-bad">(banned)</span>}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <ModActionButton label="Approve" tone="good" action={approveReview.bind(null, r.id)} />
                    <ModActionButton
                      label="Remove"
                      tone="bad"
                      confirmMessage="Permanently remove this review?"
                      action={removeReview.bind(null, r.id)}
                    />
                    {!r.user.isBanned && (
                      <ModActionButton
                        label="Ban author"
                        tone="bad"
                        confirmMessage="Ban this user from the site?"
                        action={banReviewAuthor.bind(null, r.user.id)}
                      />
                    )}
                  </div>
                </div>
                <p className="mt-3 text-sm text-text">{r.body}</p>
                {r.reports.length > 0 && (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="mb-1 text-xs uppercase tracking-wider text-text-muted">
                      Reports ({r.reports.length})
                    </p>
                    <ul className="space-y-1 text-xs text-text-muted">
                      {r.reports.map((rep) => (
                        <li key={rep.id}>
                          {rep.reason}
                          {rep.details ? ` — ${rep.details}` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="border-b border-border py-8">
        <h2 className="mb-4 text-xs uppercase tracking-wider text-text-muted">
          Banned users ({bannedUsers.length})
        </h2>
        {bannedUsers.length === 0 ? (
          <p className="text-sm text-text-muted">No banned users.</p>
        ) : (
          <ul className="space-y-2">
            {bannedUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between border border-border bg-surface px-3 py-2">
                <span className="font-num text-sm">{u.email}</span>
                <ModActionButton label="Unban" action={unbanUser.bind(null, u.id)} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="py-8">
        <h2 className="mb-4 text-xs uppercase tracking-wider text-text-muted">Recent mod actions</h2>
        {recentLogs.length === 0 ? (
          <p className="text-sm text-text-muted">No actions logged yet.</p>
        ) : (
          <div className="font-num space-y-1 text-xs text-text-muted">
            {recentLogs.map((log) => (
              <p key={log.id}>
                {log.createdAt.toISOString()} — {log.actor.email} — {log.action} {log.targetType}:{log.targetId} —{" "}
                {log.reason}
              </p>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
