"use client";

import { useEffect, useRef, useState } from "react";
import type { Term } from "@/app/generated/prisma/client";
import { useBrowseParams } from "./use-browse-params";
import { DisciplineGlyph } from "@/components/glyphs";

type DisciplineOption = {
  slug: string;
  name: string;
  colorAccent: string;
  glyphKey: string;
};

const YEAR_LEVELS = [1, 2, 3, 4] as const;
const TERMS: { value: Term; label: string }[] = [
  { value: "FALL", label: "Fall" },
  { value: "WINTER", label: "Winter" },
  { value: "SUMMER", label: "Summer" },
];
const COURSE_TYPES = [
  { value: "all", label: "All" },
  { value: "core", label: "Core" },
  { value: "elective", label: "Elective" },
] as const;

function useDebounced<T extends (...args: never[]) => void>(fn: T, delayMs: number): T {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current); }, []);

  return ((...args: Parameters<T>) => {
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => fnRef.current(...args), delayMs);
  }) as T;
}

function chipClass(active: boolean) {
  return `font-num flex items-center gap-1.5 border px-3 py-1.5 text-xs uppercase tracking-wider transition-colors ${
    active
      ? "border-accent bg-accent text-accent-contrast"
      : "border-border text-text-muted hover:border-accent hover:text-text"
  }`;
}

export function BrowseFilters({ disciplines }: { disciplines: DisciplineOption[] }) {
  const { params, updateParams } = useBrowseParams();
  const [searchValue, setSearchValue] = useState(params.q);
  const [minReviewsValue, setMinReviewsValue] = useState(params.minReviews);

  // Resync local (typed-ahead) state when the URL changes from outside this
  // component — e.g. back/forward navigation — without an effect + rerender
  // round trip. See https://react.dev/learn/you-might-not-need-an-effect
  const [prevQ, setPrevQ] = useState(params.q);
  if (params.q !== prevQ) {
    setPrevQ(params.q);
    setSearchValue(params.q);
  }
  const [prevMinReviews, setPrevMinReviews] = useState(params.minReviews);
  if (params.minReviews !== prevMinReviews) {
    setPrevMinReviews(params.minReviews);
    setMinReviewsValue(params.minReviews);
  }

  const debouncedSetQuery = useDebounced((value: string) => {
    updateParams({ q: value }, { history: "replace" });
  }, 300);

  const debouncedSetMinReviews = useDebounced((value: number) => {
    updateParams({ minReviews: value }, { history: "replace" });
  }, 200);

  function toggleDiscipline(slug: string) {
    const next = params.discipline.includes(slug)
      ? params.discipline.filter((s) => s !== slug)
      : [...params.discipline, slug];
    updateParams({ discipline: next });
  }

  function toggleYear(year: number) {
    const next = params.year.includes(year)
      ? params.year.filter((y) => y !== year)
      : [...params.year, year];
    updateParams({ year: next });
  }

  function toggleTerm(term: Term) {
    const next = params.term.includes(term)
      ? params.term.filter((t) => t !== term)
      : [...params.term, term];
    updateParams({ term: next });
  }

  return (
    <div className="space-y-5 border border-border bg-surface p-4">
      <div>
        <label htmlFor="browse-search" className="mb-1.5 block text-xs uppercase tracking-wider text-text-muted">
          Search
        </label>
        <input
          id="browse-search"
          type="search"
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            debouncedSetQuery(e.target.value);
          }}
          placeholder={params.tab === "courses" ? "Code, title, or description" : "Professor name"}
          className="w-full border border-border bg-bg px-3 py-2 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <p className="mb-1.5 text-xs uppercase tracking-wider text-text-muted">Discipline</p>
        <div className="flex flex-wrap gap-2">
          {disciplines.map((d) => {
            const active = params.discipline.includes(d.slug);
            return (
              <button
                key={d.slug}
                type="button"
                aria-pressed={active}
                onClick={() => toggleDiscipline(d.slug)}
                className={chipClass(active)}
                style={active ? { borderColor: d.colorAccent, background: d.colorAccent } : undefined}
              >
                <DisciplineGlyph glyphKey={d.glyphKey} className="h-3.5 w-3.5" />
                {d.name}
              </button>
            );
          })}
        </div>
      </div>

      {params.tab === "courses" && (
        <>
          <div>
            <p className="mb-1.5 text-xs uppercase tracking-wider text-text-muted">Year level</p>
            <div className="flex flex-wrap gap-2">
              {YEAR_LEVELS.map((year) => (
                <button
                  key={year}
                  type="button"
                  aria-pressed={params.year.includes(year)}
                  onClick={() => toggleYear(year)}
                  className={chipClass(params.year.includes(year))}
                >
                  Year {year}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs uppercase tracking-wider text-text-muted">Term offered</p>
            <div className="flex flex-wrap gap-2">
              {TERMS.map((term) => (
                <button
                  key={term.value}
                  type="button"
                  aria-pressed={params.term.includes(term.value)}
                  onClick={() => toggleTerm(term.value)}
                  className={chipClass(params.term.includes(term.value))}
                >
                  {term.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-xs uppercase tracking-wider text-text-muted">Course type</p>
            <div className="flex flex-wrap gap-2">
              {COURSE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  aria-pressed={params.type === type.value}
                  onClick={() => updateParams({ type: type.value })}
                  className={chipClass(params.type === type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div>
        <label htmlFor="min-reviews" className="mb-1.5 flex items-baseline justify-between text-xs uppercase tracking-wider text-text-muted">
          <span>Minimum reviews</span>
          <span className="font-num text-text">{minReviewsValue}</span>
        </label>
        <input
          id="min-reviews"
          type="range"
          min={0}
          max={20}
          step={1}
          value={minReviewsValue}
          onChange={(e) => {
            const value = Number(e.target.value);
            setMinReviewsValue(value);
            debouncedSetMinReviews(value);
          }}
          className="w-full accent-accent"
        />
      </div>
    </div>
  );
}
