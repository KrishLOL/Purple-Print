const TERM_LABELS: Record<string, string> = { FALL: "Fall", WINTER: "Winter", SUMMER: "Summer" };
const GRADE_LABELS: Record<string, string> = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  F: "F",
  PREFER_NOT_TO_SAY: "Grade not shared",
};

export type ReviewCardData = {
  id: string;
  authorLabel: string;
  termTaken: string;
  yearTaken: number;
  gradeReceived: string;
  useful: number;
  easy: number;
  liked: boolean;
  workloadHours: number;
  clarity: number | null;
  helpfulness: number | null;
  wouldRetake: boolean | null;
  body: string;
  helpfulCount: number;
  createdAt: string;
  professorLabel?: string | null;
  courseLabel?: string | null;
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="font-num whitespace-nowrap">
      <span className="text-text-muted">{label}</span> {value}
    </span>
  );
}

export function ReviewCard({ review }: { review: ReviewCardData }) {
  return (
    <article className="border border-border bg-surface p-4">
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <div>
          <p className="text-sm font-medium">{review.authorLabel}</p>
          <p className="font-num text-xs text-text-muted">
            {TERM_LABELS[review.termTaken] ?? review.termTaken} {review.yearTaken}
            {review.courseLabel ? ` · ${review.courseLabel}` : ""}
            {review.professorLabel ? ` · ${review.professorLabel}` : ""}
          </p>
        </div>
        <span className="font-num text-xs text-text-muted">
          {GRADE_LABELS[review.gradeReceived] ?? review.gradeReceived}
        </span>
      </header>

      <p className="mt-3 text-sm leading-relaxed text-text">{review.body}</p>

      <footer className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border pt-3 text-xs">
        <Stat label="Useful" value={`${review.useful}/5`} />
        <Stat label="Easy" value={`${review.easy}/5`} />
        <Stat label="Liked" value={review.liked ? "Yes" : "No"} />
        <Stat label="Workload" value={`${review.workloadHours}h/wk`} />
        {review.clarity != null && <Stat label="Clarity" value={`${review.clarity}/5`} />}
        {review.helpfulness != null && <Stat label="Helpfulness" value={`${review.helpfulness}/5`} />}
        {review.wouldRetake != null && (
          <Stat label="Would retake" value={review.wouldRetake ? "Yes" : "No"} />
        )}
        <span className="font-num ml-auto text-text-muted">
          {review.helpfulCount} found this helpful
        </span>
      </footer>
    </article>
  );
}
