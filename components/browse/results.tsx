"use client";

import Link from "next/link";
import { useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { CourseRow, ProfessorRow } from "@/lib/browse/query";
import type { CourseSortKey, ProfessorSortKey } from "@/lib/browse/params";
import { useBrowseParams } from "./use-browse-params";
import { DisciplineGlyph } from "@/components/glyphs";

const VIRTUALIZE_THRESHOLD = 200;
const ROW_HEIGHT = 52;
const CARD_HEIGHT = 148;

function pct(value: number | null): string {
  return value == null ? "—" : `${Math.round(value)}%`;
}

function SortHeader({
  sortKey,
  label,
  className = "",
}: {
  sortKey: CourseSortKey | ProfessorSortKey;
  label: string;
  className?: string;
}) {
  const { params, updateParams } = useBrowseParams();
  const active = params.sort === sortKey;
  const nextDir = active && params.dir === "asc" ? "desc" : "asc";

  return (
    <button
      type="button"
      role="columnheader"
      aria-sort={active ? (params.dir === "asc" ? "ascending" : "descending") : "none"}
      onClick={() => updateParams({ sort: sortKey, dir: nextDir })}
      className={`font-num flex items-center gap-1 px-3 py-2 text-left text-xs uppercase tracking-wider text-text-muted transition-colors hover:text-text ${
        active ? "text-text" : ""
      } ${className}`}
    >
      {label}
      <span className="w-2.5 text-accent">{active ? (params.dir === "asc" ? "▲" : "▼") : ""}</span>
    </button>
  );
}

const COURSE_GRID = "110px minmax(0,1fr) 48px 76px 68px 68px 68px 90px";
const PROFESSOR_GRID = "minmax(0,1.3fr) minmax(0,1fr) 76px 76px 90px 76px";

function CourseRowCells({ row }: { row: CourseRow }) {
  return (
    <>
      <div role="cell" className="flex items-center gap-1.5 px-3 py-3 font-num text-sm">
        {row.disciplineGlyph && (
          <DisciplineGlyph
            glyphKey={row.disciplineGlyph}
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: row.disciplineColor ?? undefined }}
          />
        )}
        {row.code}
      </div>
      <div role="cell" className="truncate px-3 py-3 text-sm">
        <Link href={`/course/${encodeURIComponent(row.code)}`} className="hover:text-accent">
          {row.title}
        </Link>
      </div>
      <div role="cell" className="font-num px-3 py-3 text-sm text-text-muted">{row.yearLevel}</div>
      <div role="cell" className="font-num px-3 py-3 text-sm">{row.reviewCount}</div>
      <div role="cell" className="font-num px-3 py-3 text-sm">{pct(row.useful)}</div>
      <div role="cell" className="font-num px-3 py-3 text-sm">{pct(row.easy)}</div>
      <div role="cell" className="font-num px-3 py-3 text-sm">{pct(row.liked)}</div>
      <div role="cell" className="font-num px-3 py-3 text-sm text-text-muted">
        {row.workload > 0 ? `${row.workload.toFixed(1)} hrs` : "—"}
      </div>
    </>
  );
}

function CourseCard({ row }: { row: CourseRow }) {
  return (
    <Link
      href={`/course/${encodeURIComponent(row.code)}`}
      className="block border border-border bg-surface p-4"
    >
      <div className="flex items-center gap-1.5">
        {row.disciplineGlyph && (
          <DisciplineGlyph
            glyphKey={row.disciplineGlyph}
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: row.disciplineColor ?? undefined }}
          />
        )}
        <span className="font-num text-xs uppercase tracking-wider text-text-muted">
          {row.code} · Year {row.yearLevel}
        </span>
      </div>
      <h3 className="mt-1 text-sm font-semibold">{row.title}</h3>
      <dl className="font-num mt-3 grid grid-cols-4 gap-2 text-xs">
        <div><dt className="text-text-muted">Reviews</dt><dd>{row.reviewCount}</dd></div>
        <div><dt className="text-text-muted">Useful</dt><dd>{pct(row.useful)}</dd></div>
        <div><dt className="text-text-muted">Easy</dt><dd>{pct(row.easy)}</dd></div>
        <div><dt className="text-text-muted">Liked</dt><dd>{pct(row.liked)}</dd></div>
      </dl>
    </Link>
  );
}

function ProfessorRowCells({ row }: { row: ProfessorRow }) {
  return (
    <>
      <div role="cell" className="px-3 py-3 text-sm">
        <Link href={`/professor/${row.slug}`} className="hover:text-accent">
          {row.lastName}, {row.firstName}
        </Link>
      </div>
      <div role="cell" className="flex items-center gap-1.5 truncate px-3 py-3 text-sm text-text-muted">
        {row.disciplineGlyph && (
          <DisciplineGlyph
            glyphKey={row.disciplineGlyph}
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: row.disciplineColor ?? undefined }}
          />
        )}
        {row.disciplineName ?? "—"}
      </div>
      <div role="cell" className="font-num px-3 py-3 text-sm">{row.reviewCount}</div>
      <div role="cell" className="font-num px-3 py-3 text-sm">{pct(row.clarity)}</div>
      <div role="cell" className="font-num px-3 py-3 text-sm">{pct(row.helpfulness)}</div>
      <div role="cell" className="font-num px-3 py-3 text-sm">{pct(row.retake)}</div>
    </>
  );
}

function ProfessorCard({ row }: { row: ProfessorRow }) {
  return (
    <Link href={`/professor/${row.slug}`} className="block border border-border bg-surface p-4">
      <div className="flex items-center gap-1.5">
        {row.disciplineGlyph && (
          <DisciplineGlyph
            glyphKey={row.disciplineGlyph}
            className="h-3.5 w-3.5 shrink-0"
            style={{ color: row.disciplineColor ?? undefined }}
          />
        )}
        <span className="text-xs uppercase tracking-wider text-text-muted">
          {row.disciplineName ?? "—"}
        </span>
      </div>
      <h3 className="mt-1 text-sm font-semibold">
        {row.firstName} {row.lastName}
      </h3>
      <p className="text-xs text-text-muted">{row.title}</p>
      <dl className="font-num mt-3 grid grid-cols-4 gap-2 text-xs">
        <div><dt className="text-text-muted">Reviews</dt><dd>{row.reviewCount}</dd></div>
        <div><dt className="text-text-muted">Clarity</dt><dd>{pct(row.clarity)}</dd></div>
        <div><dt className="text-text-muted">Helpful</dt><dd>{pct(row.helpfulness)}</dd></div>
        <div><dt className="text-text-muted">Retake</dt><dd>{pct(row.retake)}</dd></div>
      </dl>
    </Link>
  );
}

export function BrowseResults({
  courseRows,
  professorRows,
}: {
  courseRows: CourseRow[];
  professorRows: ProfessorRow[];
}) {
  const { params } = useBrowseParams();
  const isCourses = params.tab === "courses";
  const rows = isCourses ? courseRows : professorRows;
  const count = rows.length;
  const virtualize = count > VIRTUALIZE_THRESHOLD;

  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    enabled: virtualize,
    overscan: 8,
  });
  const mobileVirtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => CARD_HEIGHT,
    enabled: virtualize,
    overscan: 6,
  });

  const grid = isCourses ? COURSE_GRID : PROFESSOR_GRID;
  const noun = isCourses ? "course" : "professor";

  return (
    <div>
      <p aria-live="polite" className="sr-only">
        {count} {noun}
        {count === 1 ? "" : "s"} found
      </p>
      <p className="font-num mb-2 text-xs text-text-muted">
        {count} {noun}
        {count === 1 ? "" : "s"}
      </p>

      {count === 0 ? (
        <div className="border border-border bg-surface p-8 text-center text-sm text-text-muted">
          No {noun}s match these filters.
        </div>
      ) : (
        <div ref={scrollRef} className={virtualize ? "max-h-[70vh] overflow-y-auto" : ""}>
          {/* Desktop grid-table */}
          <div className="hidden sm:block" role="table" aria-label={`${noun} results`}>
            <div
              role="row"
              className="sticky top-0 z-10 grid border border-border bg-surface"
              style={{ gridTemplateColumns: grid }}
            >
              {isCourses ? (
                <>
                  <SortHeader sortKey="code" label="Code" />
                  <SortHeader sortKey="title" label="Title" />
                  <div role="columnheader" className="px-3 py-2 text-xs uppercase tracking-wider text-text-muted">Yr</div>
                  <SortHeader sortKey="reviewCount" label="Revs" />
                  <SortHeader sortKey="useful" label="Useful" />
                  <SortHeader sortKey="easy" label="Easy" />
                  <SortHeader sortKey="liked" label="Liked" />
                  <SortHeader sortKey="workload" label="Workload" />
                </>
              ) : (
                <>
                  <SortHeader sortKey="lastName" label="Name" />
                  <div role="columnheader" className="px-3 py-2 text-xs uppercase tracking-wider text-text-muted">Discipline</div>
                  <SortHeader sortKey="reviewCount" label="Revs" />
                  <SortHeader sortKey="clarity" label="Clarity" />
                  <SortHeader sortKey="helpfulness" label="Helpful" />
                  <SortHeader sortKey="retake" label="Retake" />
                </>
              )}
            </div>

            {virtualize ? (
              <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
                {virtualizer.getVirtualItems().map((item) => (
                  <div
                    key={item.key}
                    role="row"
                    className="absolute inset-x-0 grid border-x border-b border-border odd:bg-surface even:bg-bg"
                    style={{ gridTemplateColumns: grid, height: item.size, transform: `translateY(${item.start}px)` }}
                  >
                    {isCourses ? (
                      <CourseRowCells row={courseRows[item.index]} />
                    ) : (
                      <ProfessorRowCells row={professorRows[item.index]} />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              isCourses
                ? courseRows.map((row) => (
                    <div
                      key={row.id}
                      role="row"
                      className="grid border-x border-b border-border odd:bg-surface even:bg-bg"
                      style={{ gridTemplateColumns: grid }}
                    >
                      <CourseRowCells row={row} />
                    </div>
                  ))
                : professorRows.map((row) => (
                    <div
                      key={row.id}
                      role="row"
                      className="grid border-x border-b border-border odd:bg-surface even:bg-bg"
                      style={{ gridTemplateColumns: grid }}
                    >
                      <ProfessorRowCells row={row} />
                    </div>
                  ))
            )}
          </div>

          {/* Mobile stacked cards */}
          <div className="grid gap-3 sm:hidden">
            {virtualize ? (
              <div style={{ height: mobileVirtualizer.getTotalSize(), position: "relative" }}>
                {mobileVirtualizer.getVirtualItems().map((item) => (
                  <div
                    key={item.key}
                    className="absolute inset-x-0"
                    style={{ height: item.size, transform: `translateY(${item.start}px)` }}
                  >
                    {isCourses ? (
                      <CourseCard row={courseRows[item.index]} />
                    ) : (
                      <ProfessorCard row={professorRows[item.index]} />
                    )}
                  </div>
                ))}
              </div>
            ) : isCourses ? (
              courseRows.map((row) => <CourseCard key={row.id} row={row} />)
            ) : (
              professorRows.map((row) => <ProfessorCard key={row.id} row={row} />)
            )}
          </div>
        </div>
      )}
    </div>
  );
}
