"use client";

import { useMemo, useState } from "react";
import { ReviewCard, type ReviewCardData } from "@/components/review-card";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "helpful", label: "Most helpful" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
] as const;

type SortValue = (typeof SORTS)[number]["value"];

export function CourseReviewList({
  reviews,
  professorOptions,
}: {
  reviews: ReviewCardData[];
  professorOptions: string[];
}) {
  const [sort, setSort] = useState<SortValue>("newest");
  const [professorFilter, setProfessorFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");

  const filtered = useMemo(() => {
    let rows = reviews;
    if (professorFilter) {
      rows = rows.filter((r) => r.professorLabel === professorFilter);
    }
    if (termFilter) {
      rows = rows.filter((r) => r.termTaken === termFilter);
    }
    const sorted = [...rows];
    switch (sort) {
      case "helpful":
        sorted.sort((a, b) => b.helpfulCount - a.helpfulCount);
        break;
      case "highest":
        sorted.sort((a, b) => b.useful - a.useful);
        break;
      case "lowest":
        sorted.sort((a, b) => a.useful - b.useful);
        break;
      default:
        sorted.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }
    return sorted;
  }, [reviews, professorFilter, termFilter, sort]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
          Sort
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortValue)}
            className="border border-border bg-bg px-2 py-1 text-sm text-text focus:border-accent focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {professorOptions.length > 0 && (
          <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
            Professor
            <select
              value={professorFilter}
              onChange={(e) => setProfessorFilter(e.target.value)}
              className="border border-border bg-bg px-2 py-1 text-sm text-text focus:border-accent focus:outline-none"
            >
              <option value="">Any</option>
              {professorOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className="flex items-center gap-2 text-xs uppercase tracking-wider text-text-muted">
          Term
          <select
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
            className="border border-border bg-bg px-2 py-1 text-sm text-text focus:border-accent focus:outline-none"
          >
            <option value="">Any</option>
            <option value="FALL">Fall</option>
            <option value="WINTER">Winter</option>
            <option value="SUMMER">Summer</option>
          </select>
        </label>

        <span aria-live="polite" className="font-num ml-auto text-xs text-text-muted">
          {filtered.length} review{filtered.length === 1 ? "" : "s"}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="border border-border bg-surface p-6 text-center text-sm text-text-muted">
          No reviews match these filters.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}
