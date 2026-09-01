"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CornerCard } from "@/components/ui/corner-card";
import {
  GRADE_VALUES,
  REVIEW_DRAFT_STORAGE_KEY,
  TERM_VALUES,
  reviewFormSchema,
  type ReviewFormValues,
} from "@/lib/review-schema";
import { submitReview } from "@/app/review/new/actions";
import { findMentionedOtherProfessor } from "@/lib/moderation";

type CourseOption = { id: string; code: string; title: string };
type ProfessorOption = {
  id: string;
  firstName: string;
  lastName: string;
  courseIds: string[];
};

const STEPS = ["Course", "Professor", "Term", "Ratings", "Write", "Preview"] as const;

const GRADE_LABELS: Record<string, string> = {
  A: "A",
  B: "B",
  C: "C",
  D: "D",
  F: "F",
  PREFER_NOT_TO_SAY: "Prefer not to say",
};
const TERM_LABELS: Record<string, string> = { FALL: "Fall", WINTER: "Winter", SUMMER: "Summer" };

type DraftState = {
  courseId: string | null;
  professorId: string | null;
  noProfessor: boolean;
  otherProfessor: boolean;
  otherProfessorName: string;
  termTaken: (typeof TERM_VALUES)[number] | null;
  yearTaken: number | null;
  useful: number;
  easy: number;
  liked: boolean | null;
  workloadHours: number;
  clarity: number;
  helpfulness: number;
  wouldRetake: boolean | null;
  gradeReceived: (typeof GRADE_VALUES)[number] | null;
  body: string;
};

const EMPTY_DRAFT: DraftState = {
  courseId: null,
  professorId: null,
  noProfessor: false,
  otherProfessor: false,
  otherProfessorName: "",
  termTaken: null,
  yearTaken: null,
  useful: 3,
  easy: 3,
  liked: null,
  workloadHours: 6,
  clarity: 3,
  helpfulness: 3,
  wouldRetake: null,
  gradeReceived: null,
  body: "",
};

function toFormValues(draft: DraftState): ReviewFormValues | null {
  if (!draft.courseId || !draft.termTaken || !draft.yearTaken || draft.liked == null || !draft.gradeReceived) {
    return null;
  }
  const hasKnownProfessor = Boolean(draft.professorId) && !draft.noProfessor && !draft.otherProfessor;
  const hasOtherProfessor = draft.otherProfessor && draft.otherProfessorName.trim().length >= 2;
  const hasProfessorInfo = hasKnownProfessor || hasOtherProfessor;
  return {
    courseId: draft.courseId,
    professorId: hasKnownProfessor ? draft.professorId : null,
    suggestedProfessorName: hasOtherProfessor ? draft.otherProfessorName.trim() : null,
    termTaken: draft.termTaken,
    yearTaken: draft.yearTaken,
    useful: draft.useful,
    easy: draft.easy,
    liked: draft.liked,
    workloadHours: draft.workloadHours,
    clarity: hasProfessorInfo ? draft.clarity : null,
    helpfulness: hasProfessorInfo ? draft.helpfulness : null,
    wouldRetake: hasProfessorInfo ? draft.wouldRetake : null,
    gradeReceived: draft.gradeReceived,
    body: draft.body,
  };
}

export function ReviewWizard({
  courses,
  professors,
  initialCourseId,
}: {
  courses: CourseOption[];
  professors: ProfessorOption[];
  initialCourseId: string | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<DraftState>({
    ...EMPTY_DRAFT,
    courseId: initialCourseId,
  });
  const [hydrated, setHydrated] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load any saved draft after mount only, to avoid an SSR/client mismatch
  // (localStorage doesn't exist on the server) — a genuine external-system
  // read, not a value derived from props/state.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(REVIEW_DRAFT_STORAGE_KEY);
      if (raw) {
        const parsedDraft = JSON.parse(raw);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDraft((prev) => ({ ...prev, ...parsedDraft }));
      }
    } catch {
      // ignore malformed drafts
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(REVIEW_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [draft, hydrated]);

  function update<K extends keyof DraftState>(key: K, value: DraftState[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  const selectedCourse = courses.find((c) => c.id === draft.courseId) ?? null;
  const eligibleProfessors = useMemo(
    () => professors.filter((p) => draft.courseId && p.courseIds.includes(draft.courseId)),
    [professors, draft.courseId],
  );
  const selectedProfessor = eligibleProfessors.find((p) => p.id === draft.professorId) ?? null;

  const otherProfessorMentioned = useMemo(
    () =>
      findMentionedOtherProfessor(draft.body, professors, {
        excludeId: draft.professorId,
        excludeFullName: draft.otherProfessor ? draft.otherProfessorName : null,
      }),
    [draft.body, draft.professorId, draft.otherProfessor, draft.otherProfessorName, professors],
  );

  function canAdvance(): boolean {
    switch (step) {
      case 0:
        return Boolean(draft.courseId);
      case 1:
        return (
          draft.noProfessor ||
          (draft.otherProfessor ? draft.otherProfessorName.trim().length >= 2 : Boolean(draft.professorId))
        );
      case 2:
        return Boolean(draft.termTaken && draft.yearTaken);
      case 3:
        return draft.liked != null;
      case 4:
        return draft.body.trim().length >= 30 && Boolean(draft.gradeReceived);
      default:
        return true;
    }
  }

  async function handleSubmit() {
    const values = toFormValues(draft);
    if (!values) {
      setSubmitError("Something's missing — go back and fill in every step.");
      return;
    }
    const parsed = reviewFormSchema.safeParse(values);
    if (!parsed.success) {
      setSubmitError(parsed.error.issues[0]?.message ?? "That review isn't valid.");
      return;
    }
    setSubmitError(null);
    startTransition(async () => {
      const result = await submitReview(parsed.data);
      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }
      window.localStorage.removeItem(REVIEW_DRAFT_STORAGE_KEY);
      router.push(`/course/${encodeURIComponent(selectedCourse?.code ?? "")}`);
    });
  }

  return (
    <div>
      <ol className="font-num mb-6 flex flex-wrap gap-2 text-xs uppercase tracking-wider">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`border px-2 py-1 ${i === step ? "border-accent text-accent" : "border-border text-text-muted"}`}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      {step === 0 && (
        <CourseStep courses={courses} value={draft.courseId} onChange={(id) => update("courseId", id)} />
      )}

      {step === 1 && (
        <ProfessorStep
          professors={eligibleProfessors}
          value={draft.professorId}
          noProfessor={draft.noProfessor}
          otherProfessor={draft.otherProfessor}
          otherProfessorName={draft.otherProfessorName}
          onChange={(id) => {
            update("professorId", id);
            update("noProfessor", false);
            update("otherProfessor", false);
          }}
          onNoProfessor={(v) => {
            update("noProfessor", v);
            if (v) update("otherProfessor", false);
          }}
          onOtherProfessor={(v) => {
            update("otherProfessor", v);
            if (v) update("noProfessor", false);
          }}
          onOtherProfessorName={(v) => update("otherProfessorName", v)}
        />
      )}

      {step === 2 && (
        <TermStep
          term={draft.termTaken}
          year={draft.yearTaken}
          onTerm={(t) => update("termTaken", t)}
          onYear={(y) => update("yearTaken", y)}
        />
      )}

      {step === 3 && (
        <RatingsStep
          draft={draft}
          hasProfessor={
            draft.noProfessor
              ? false
              : draft.otherProfessor
                ? draft.otherProfessorName.trim().length >= 2
                : Boolean(selectedProfessor)
          }
          update={update}
        />
      )}

      {step === 4 && (
        <WriteStep
          body={draft.body}
          grade={draft.gradeReceived}
          otherProfessorMentioned={otherProfessorMentioned}
          onBody={(v) => update("body", v)}
          onGrade={(g) => update("gradeReceived", g)}
        />
      )}

      {step === 5 && (
        <PreviewStep
          draft={draft}
          course={selectedCourse}
          professor={draft.noProfessor || draft.otherProfessor ? null : selectedProfessor}
          otherProfessorName={draft.otherProfessor ? draft.otherProfessorName.trim() : null}
        />
      )}

      {submitError && (
        <p className="mt-4 border border-bad px-3 py-2 text-sm text-bad">{submitError}</p>
      )}

      <div className="mt-8 flex justify-between">
        <Button
          type="button"
          variant="secondary"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
        >
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button type="button" variant="primary" disabled={!canAdvance()} onClick={() => setStep((s) => s + 1)}>
            Next
          </Button>
        ) : (
          <Button type="button" variant="primary" disabled={isPending} onClick={handleSubmit}>
            {isPending ? "Submitting…" : "Submit review"}
          </Button>
        )}
      </div>
    </div>
  );
}

function CourseStep({
  courses,
  value,
  onChange,
}: {
  courses: CourseOption[];
  value: string | null;
  onChange: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courses.slice(0, 30);
    return courses
      .filter((c) => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q))
      .slice(0, 30);
  }, [courses, query]);

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Which course?</h2>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by code or title"
        className="mb-3 w-full border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
      />
      <div className="max-h-80 space-y-1 overflow-y-auto">
        {filtered.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            className={`font-num flex w-full items-center justify-between border px-3 py-2 text-left text-sm ${
              value === c.id ? "border-accent bg-accent text-accent-contrast" : "border-border hover:border-accent"
            }`}
          >
            <span>{c.code}</span>
            <span className="truncate pl-3 text-xs opacity-80">{c.title}</span>
          </button>
        ))}
        {filtered.length === 0 && <p className="text-sm text-text-muted">No courses match.</p>}
      </div>
    </div>
  );
}

function ProfessorStep({
  professors,
  value,
  noProfessor,
  otherProfessor,
  otherProfessorName,
  onChange,
  onNoProfessor,
  onOtherProfessor,
  onOtherProfessorName,
}: {
  professors: ProfessorOption[];
  value: string | null;
  noProfessor: boolean;
  otherProfessor: boolean;
  otherProfessorName: string;
  onChange: (id: string) => void;
  onNoProfessor: (v: boolean) => void;
  onOtherProfessor: (v: boolean) => void;
  onOtherProfessorName: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Which professor?</h2>
      <div className="space-y-1">
        {professors.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            className={`flex w-full border px-3 py-2 text-left text-sm ${
              !noProfessor && !otherProfessor && value === p.id
                ? "border-accent bg-accent text-accent-contrast"
                : "border-border hover:border-accent"
            }`}
          >
            {p.firstName} {p.lastName}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onOtherProfessor(true)}
          className={`w-full border px-3 py-2 text-left text-sm ${
            otherProfessor ? "border-accent bg-accent text-accent-contrast" : "border-border hover:border-accent"
          }`}
        >
          Other — not listed
        </button>
        {otherProfessor && (
          <input
            type="text"
            value={otherProfessorName}
            onChange={(e) => onOtherProfessorName(e.target.value)}
            placeholder="Professor's name"
            maxLength={80}
            className="w-full border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
          />
        )}
        <button
          type="button"
          onClick={() => onNoProfessor(true)}
          className={`w-full border px-3 py-2 text-left text-sm ${
            noProfessor ? "border-accent bg-accent text-accent-contrast" : "border-border hover:border-accent"
          }`}
        >
          No professor / can&rsquo;t remember
        </button>
        {professors.length === 0 && (
          <p className="text-sm text-text-muted">No professors on file for this course yet — that&rsquo;s fine.</p>
        )}
      </div>
      {otherProfessor && (
        <p className="mt-2 text-xs text-text-muted">
          If enough other students name the same professor for this course, we&rsquo;ll add them for real.
        </p>
      )}
    </div>
  );
}

function TermStep({
  term,
  year,
  onTerm,
  onYear,
}: {
  term: string | null;
  year: number | null;
  onTerm: (t: (typeof TERM_VALUES)[number]) => void;
  onYear: (y: number) => void;
}) {
  const years = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() - i);
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">When did you take it?</h2>
      <p className="mb-1.5 text-xs uppercase tracking-wider text-text-muted">Term</p>
      <div className="mb-4 flex gap-2">
        {TERM_VALUES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onTerm(t)}
            className={`font-num border px-3 py-1.5 text-xs uppercase tracking-wider ${
              term === t ? "border-accent bg-accent text-accent-contrast" : "border-border hover:border-accent"
            }`}
          >
            {TERM_LABELS[t]}
          </button>
        ))}
      </div>
      <p className="mb-1.5 text-xs uppercase tracking-wider text-text-muted">Year</p>
      <div className="flex flex-wrap gap-2">
        {years.map((y) => (
          <button
            key={y}
            type="button"
            onClick={() => onYear(y)}
            className={`font-num border px-3 py-1.5 text-xs ${
              year === y ? "border-accent bg-accent text-accent-contrast" : "border-border hover:border-accent"
            }`}
          >
            {y}
          </button>
        ))}
      </div>
    </div>
  );
}

function RatingSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-xs uppercase tracking-wider text-text-muted">{label}</label>
        <span className="font-num text-sm">{value}/5</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </div>
  );
}

function YesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs uppercase tracking-wider text-text-muted">{label}</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`border px-4 py-1.5 text-sm ${value === true ? "border-accent bg-accent text-accent-contrast" : "border-border hover:border-accent"}`}
        >
          Yes
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`border px-4 py-1.5 text-sm ${value === false ? "border-accent bg-accent text-accent-contrast" : "border-border hover:border-accent"}`}
        >
          No
        </button>
      </div>
    </div>
  );
}

function RatingsStep({
  draft,
  hasProfessor,
  update,
}: {
  draft: DraftState;
  hasProfessor: boolean;
  update: <K extends keyof DraftState>(key: K, value: DraftState[K]) => void;
}) {
  return (
    <div className="space-y-5">
      <h2 className="mb-1 text-lg font-semibold">Rate it</h2>
      <RatingSlider label="Useful" value={draft.useful} onChange={(v) => update("useful", v)} />
      <RatingSlider label="Easy" value={draft.easy} onChange={(v) => update("easy", v)} />
      <YesNo label="Would you recommend / did you like it?" value={draft.liked} onChange={(v) => update("liked", v)} />
      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <label className="text-xs uppercase tracking-wider text-text-muted">Workload (hrs/week)</label>
          <span className="font-num text-sm">{draft.workloadHours}h</span>
        </div>
        <input
          type="range"
          min={0}
          max={30}
          step={1}
          value={draft.workloadHours}
          onChange={(e) => update("workloadHours", Number(e.target.value))}
          className="w-full accent-accent"
        />
      </div>

      {hasProfessor && (
        <div className="space-y-5 border-t border-border pt-5">
          <p className="text-xs uppercase tracking-wider text-text-muted">About the professor</p>
          <RatingSlider label="Clarity" value={draft.clarity} onChange={(v) => update("clarity", v)} />
          <RatingSlider label="Helpfulness" value={draft.helpfulness} onChange={(v) => update("helpfulness", v)} />
          <YesNo label="Would you take them again?" value={draft.wouldRetake} onChange={(v) => update("wouldRetake", v)} />
        </div>
      )}
    </div>
  );
}

function WriteStep({
  body,
  grade,
  otherProfessorMentioned,
  onBody,
  onGrade,
}: {
  body: string;
  grade: string | null;
  otherProfessorMentioned: string | null;
  onBody: (v: string) => void;
  onGrade: (g: (typeof GRADE_VALUES)[number]) => void;
}) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Write your review</h2>
      <textarea
        value={body}
        onChange={(e) => onBody(e.target.value)}
        rows={8}
        placeholder="What should someone picking this course know? (30-2000 characters)"
        className="w-full border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
      />
      <div className="mt-1 flex items-center justify-between">
        <span className={`font-num text-xs ${body.length < 30 || body.length > 2000 ? "text-bad" : "text-text-muted"}`}>
          {body.length} / 2000
        </span>
      </div>
      {otherProfessorMentioned && (
        <p className="mt-2 border border-warn px-3 py-2 text-xs text-warn">
          This mentions &ldquo;{otherProfessorMentioned}&rdquo;, who isn&rsquo;t the professor you selected. Double-check
          you&rsquo;re reviewing the right person.
        </p>
      )}

      <p className="mt-5 mb-1.5 text-xs uppercase tracking-wider text-text-muted">Grade received</p>
      <div className="flex flex-wrap gap-2">
        {GRADE_VALUES.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onGrade(g)}
            className={`font-num border px-3 py-1.5 text-xs ${
              grade === g ? "border-accent bg-accent text-accent-contrast" : "border-border hover:border-accent"
            }`}
          >
            {GRADE_LABELS[g]}
          </button>
        ))}
      </div>
    </div>
  );
}

function PreviewStep({
  draft,
  course,
  professor,
  otherProfessorName,
}: {
  draft: DraftState;
  course: CourseOption | null;
  professor: ProfessorOption | null;
  otherProfessorName: string | null;
}) {
  const professorLabel = professor
    ? `${professor.firstName} ${professor.lastName}`
    : otherProfessorName
      ? `${otherProfessorName} (not yet listed)`
      : null;
  const hasProfessorInfo = Boolean(professor || otherProfessorName);
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Preview</h2>
      <CornerCard>
        <p className="font-num text-xs text-text-muted">
          {course?.code} {professorLabel ? `· ${professorLabel}` : "· No professor"} ·{" "}
          {draft.termTaken ? TERM_LABELS[draft.termTaken] : ""} {draft.yearTaken}
        </p>
        <p className="mt-3 text-sm leading-relaxed">{draft.body}</p>
        <div className="font-num mt-3 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-text-muted">
          <span>Useful {draft.useful}/5</span>
          <span>Easy {draft.easy}/5</span>
          <span>Liked {draft.liked ? "Yes" : "No"}</span>
          <span>Workload {draft.workloadHours}h/wk</span>
          {hasProfessorInfo && (
            <>
              <span>Clarity {draft.clarity}/5</span>
              <span>Helpfulness {draft.helpfulness}/5</span>
              <span>Retake {draft.wouldRetake ? "Yes" : "No"}</span>
            </>
          )}
        </div>
      </CornerCard>
      <p className="mt-3 text-xs text-text-muted">
        This is exactly how your review will appear — anonymized to your discipline and grad year, never your name.
      </p>
    </div>
  );
}
