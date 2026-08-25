import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getCourseDetail } from "@/lib/course-detail";
import { MetricDial } from "@/components/ui/metric-dial";
import { BarHistogram } from "@/components/ui/bar-histogram";
import { CornerCard } from "@/components/ui/corner-card";
import { DisciplineBadge } from "@/components/discipline-badge";
import { CourseReviewList } from "@/components/course/review-list";
import { StickyWriteReviewCta } from "@/components/sticky-cta";
import { SaveCourseButton } from "@/components/course/save-course-button";
import { buildCourseJsonLd } from "@/lib/json-ld";

const TERM_LABELS: Record<string, string> = { FALL: "Fall", WINTER: "Winter", SUMMER: "Summer" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const detail = await getCourseDetail(decodeURIComponent(code));
  if (!detail) return { title: "Course not found" };
  return {
    title: `${detail.course.code} — ${detail.course.title}`,
    description: detail.course.description,
  };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const detail = await getCourseDetail(decodeURIComponent(code));
  if (!detail) notFound();

  const { course, professorCards, reviewCards, workloadBuckets, gradeBuckets, useful, easy, liked } = detail;

  const session = await auth();
  const alreadySaved = session?.user
    ? Boolean(
        await prisma.savedCourse.findUnique({
          where: { userId_courseId: { userId: session.user.id, courseId: course.id } },
        }),
      )
    : false;

  const jsonLd = buildCourseJsonLd({
    code: course.code,
    title: course.title,
    description: course.description,
    reviewCount: course.reviewCount,
    avgUseful: course.avgUseful,
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className="border-b border-border pb-6">
        <div className="flex items-start justify-between gap-3">
          <p className="font-num text-sm uppercase tracking-[0.2em] text-text-muted">{course.code}</p>
          {session?.user && <SaveCourseButton courseId={course.id} initiallySaved={alreadySaved} />}
        </div>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">{course.title}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {course.discipline && (
            <DisciplineBadge
              name={course.discipline.name}
              colorAccent={course.discipline.colorAccent}
              glyphKey={course.discipline.glyphKey}
            />
          )}
          <span className="font-num border border-border px-2.5 py-1 text-xs uppercase tracking-wider text-text-muted">
            Year {course.yearLevel}
          </span>
          <span className="font-num border border-border px-2.5 py-1 text-xs uppercase tracking-wider text-text-muted">
            {course.termsOffered.map((t) => TERM_LABELS[t] ?? t).join(" / ") || "Term TBD"}
          </span>
          <span className="font-num border border-border px-2.5 py-1 text-xs uppercase tracking-wider text-text-muted">
            {course.isCore ? "Core" : "Elective"}
          </span>
        </div>
        <p className="mt-4 max-w-prose text-sm text-text-muted">{course.description}</p>
        {course.summerEquivalentNote && (
          <p className="mt-3 max-w-prose border-l-2 border-accent/50 pl-3 text-xs text-text-muted">
            <span className="font-medium text-text">Summer option: </span>
            {course.summerEquivalentNote}
          </p>
        )}
      </header>

      <section className="flex flex-wrap justify-center gap-8 border-b border-border py-8">
        <MetricDial label="Useful" value={useful} sampleSize={course.reviewCount} tone="accent" />
        <MetricDial label="Easy" value={easy} sampleSize={course.reviewCount} tone="good" />
        <MetricDial label="Liked" value={liked} sampleSize={course.reviewCount} tone="warn" />
      </section>

      <section className="grid gap-6 border-b border-border py-8 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-xs uppercase tracking-wider text-text-muted">
            Workload (hrs/week)
          </h2>
          <BarHistogram buckets={workloadBuckets} />
        </div>
        <div>
          <h2 className="mb-3 text-xs uppercase tracking-wider text-text-muted">
            Grade distribution
          </h2>
          <BarHistogram buckets={gradeBuckets} />
          <p className="mt-3 text-xs text-text-muted">
            Self-reported by reviewers, not verified — treat this as anecdotal, not statistical.
          </p>
        </div>
      </section>

      <section className="border-b border-border py-8">
        <h2 className="mb-3 text-xs uppercase tracking-wider text-text-muted">Prerequisites</h2>
        <div className="font-num flex flex-wrap items-center gap-2 text-sm text-text-muted">
          <span className="border border-border px-2.5 py-1">{course.prerequisites || "None"}</span>
        </div>
        <h2 className="mt-4 mb-3 text-xs uppercase tracking-wider text-text-muted">Antirequisites</h2>
        <div className="font-num flex flex-wrap items-center gap-2 text-sm text-text-muted">
          <span className="border border-border px-2.5 py-1">{course.antirequisites || "None"}</span>
        </div>
      </section>

      {professorCards.length > 0 && (
        <section className="border-b border-border py-8">
          <h2 className="mb-4 text-xs uppercase tracking-wider text-text-muted">
            Professors who teach this
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {professorCards.map((p) => (
              <Link key={p.slug} href={`/professor/${p.slug}`}>
                <CornerCard className="h-full transition-colors hover:border-accent">
                  <p className="text-sm font-semibold">
                    {p.firstName} {p.lastName}
                  </p>
                  <p className="text-xs text-text-muted">{p.title}</p>
                  <dl className="font-num mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <dt className="text-text-muted">Clarity</dt>
                      <dd>{p.clarity == null ? "—" : `${p.clarity}%`}</dd>
                    </div>
                    <div>
                      <dt className="text-text-muted">Helpful</dt>
                      <dd>{p.helpfulness == null ? "—" : `${p.helpfulness}%`}</dd>
                    </div>
                    <div>
                      <dt className="text-text-muted">Retake</dt>
                      <dd>{p.retake == null ? "—" : `${p.retake}%`}</dd>
                    </div>
                  </dl>
                  <p className="font-num mt-2 text-[11px] text-text-muted">
                    for this course: {p.reviewCountForCourse} review
                    {p.reviewCountForCourse === 1 ? "" : "s"}
                  </p>
                </CornerCard>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="py-8">
        <h2 className="mb-4 text-xs uppercase tracking-wider text-text-muted">Reviews</h2>
        <CourseReviewList
          reviews={reviewCards}
          professorOptions={[
            ...new Set(reviewCards.map((r) => r.professorLabel).filter((v): v is string => Boolean(v))),
          ]}
        />
      </section>

      <StickyWriteReviewCta href={`/review/new?course=${encodeURIComponent(course.code)}`} />
    </main>
  );
}
