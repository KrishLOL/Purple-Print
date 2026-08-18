import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProfessorDetail } from "@/lib/professor-detail";
import { MetricDial } from "@/components/ui/metric-dial";
import { CornerCard } from "@/components/ui/corner-card";
import { DisciplineBadge } from "@/components/discipline-badge";
import { ReviewCard } from "@/components/review-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getProfessorDetail(decodeURIComponent(slug));
  if (!detail) return { title: "Professor not found" };
  return {
    title: `${detail.professor.firstName} ${detail.professor.lastName}`,
    description: `Reviews of ${detail.professor.firstName} ${detail.professor.lastName}, ${detail.professor.title}.`,
  };
}

export default async function ProfessorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const detail = await getProfessorDetail(decodeURIComponent(slug));
  if (!detail) notFound();

  const { professor, coursesTaught, clarity, helpfulness, retake } = detail;
  const correctionSubject = encodeURIComponent(
    `Correction request: ${professor.firstName} ${professor.lastName}`,
  );
  const reportSubject = encodeURIComponent(
    `Inaccurate review: ${professor.firstName} ${professor.lastName}`,
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-8">
      <header className="border-b border-border pb-6">
        <p className="font-num text-sm uppercase tracking-[0.2em] text-text-muted">
          {professor.title}
        </p>
        <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">
          {professor.firstName} {professor.lastName}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {professor.discipline && (
            <DisciplineBadge
              name={professor.discipline.name}
              colorAccent={professor.discipline.colorAccent}
              glyphKey={professor.discipline.glyphKey}
            />
          )}
          {professor.hasResponded && (
            <span className="font-num border border-good px-2.5 py-1 text-xs uppercase tracking-wider text-good">
              Professor has responded
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <a
            href={`mailto:corrections@westerneninsider.example?subject=${correctionSubject}`}
            className="text-accent underline underline-offset-4"
          >
            Request a correction
          </a>
          <a
            href={`mailto:reports@westerneninsider.example?subject=${reportSubject}`}
            className="text-bad underline underline-offset-4"
          >
            Report an inaccurate review
          </a>
        </div>
      </header>

      <section className="flex flex-wrap justify-center gap-8 border-b border-border py-8">
        <MetricDial label="Clarity" value={clarity} sampleSize={professor.reviewCount} tone="accent" />
        <MetricDial label="Helpfulness" value={helpfulness} sampleSize={professor.reviewCount} tone="good" />
        <MetricDial label="Would retake" value={retake} sampleSize={professor.reviewCount} tone="warn" />
      </section>

      {coursesTaught.length > 0 && (
        <section className="border-b border-border py-8">
          <h2 className="mb-4 text-xs uppercase tracking-wider text-text-muted">Courses taught</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {coursesTaught.map((c) => (
              <Link key={c.code} href={`/course/${encodeURIComponent(c.code)}`}>
                <CornerCard className="h-full transition-colors hover:border-accent">
                  <p className="font-num text-xs uppercase tracking-wider text-text-muted">{c.code}</p>
                  <p className="text-sm font-semibold">{c.title}</p>
                  <dl className="font-num mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <dt className="text-text-muted">Clarity</dt>
                      <dd>{c.clarity == null ? "—" : `${c.clarity}%`}</dd>
                    </div>
                    <div>
                      <dt className="text-text-muted">Helpful</dt>
                      <dd>{c.helpfulness == null ? "—" : `${c.helpfulness}%`}</dd>
                    </div>
                    <div>
                      <dt className="text-text-muted">Retake</dt>
                      <dd>{c.retake == null ? "—" : `${c.retake}%`}</dd>
                    </div>
                  </dl>
                </CornerCard>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="py-8">
        <h2 className="mb-4 text-xs uppercase tracking-wider text-text-muted">
          Reviews, by course
        </h2>
        {coursesTaught.every((c) => c.reviews.length === 0) ? (
          <p className="border border-border bg-surface p-6 text-center text-sm text-text-muted">
            No reviews yet.
          </p>
        ) : (
          <div className="space-y-8">
            {coursesTaught
              .filter((c) => c.reviews.length > 0)
              .map((c) => (
                <div key={c.code}>
                  <h3 className="font-num mb-3 text-sm text-text-muted">
                    {c.code} — {c.title}
                  </h3>
                  <div className="space-y-3">
                    {c.reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
