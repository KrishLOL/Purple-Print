"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export type RoadmapSlot = {
  yearLevel: number;
  term: string;
  sortOrder: number;
  electiveLabel: string | null;
  course: { code: string; title: string } | null;
};

const TERM_LABELS: Record<string, string> = { FALL: "Term A (Fall)", WINTER: "Term B (Winter)" };

export function RoadmapView({
  disciplines,
  selectedSlug,
  slots,
}: {
  disciplines: { slug: string; name: string; colorAccent: string }[];
  selectedSlug: string;
  slots: RoadmapSlot[];
}) {
  const router = useRouter();
  const pathname = usePathname();

  function changeDiscipline(slug: string) {
    router.push(`${pathname}?discipline=${slug}`, { scroll: false });
  }

  const years = [...new Set(slots.map((s) => s.yearLevel))].sort((a, b) => a - b);
  const terms = ["FALL", "WINTER"];

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <select
          value={selectedSlug}
          onChange={(e) => changeDiscipline(e.target.value)}
          className="font-num border border-border bg-surface px-3 py-2 text-xs uppercase tracking-wider text-text focus:border-accent focus:outline-none"
          aria-label="Choose a discipline"
        >
          {disciplines.map((d) => (
            <option key={d.slug} value={d.slug}>
              {d.name}
            </option>
          ))}
        </select>
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <span className="inline-block h-3 w-6 border border-solid border-text-muted bg-bg" aria-hidden />
          required course
        </span>
        <span className="flex items-center gap-1.5 text-xs text-text-muted">
          <span className="inline-block h-3 w-6 border border-dashed border-text-muted bg-bg" aria-hidden />
          elective slot
        </span>
      </div>

      {years.length === 0 ? (
        <p className="border border-border bg-surface p-6 text-center text-sm text-text-muted">
          No roadmap data for this discipline yet.
        </p>
      ) : (
        <div className="space-y-8">
          {years.map((year) => (
            <section key={year}>
              <h2 className="font-num mb-3 text-xs uppercase tracking-wider text-text-muted">Year {year}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {terms.map((term) => {
                  const cellSlots = slots
                    .filter((s) => s.yearLevel === year && s.term === term)
                    .sort((a, b) => a.sortOrder - b.sortOrder);
                  if (cellSlots.length === 0) return null;
                  return (
                    <div key={term} className="border border-border bg-surface p-4">
                      <p className="font-num mb-3 text-xs uppercase tracking-wider text-text-muted">
                        {TERM_LABELS[term] ?? term}
                      </p>
                      <div className="space-y-2">
                        {cellSlots.map((slot, i) =>
                          slot.course ? (
                            <Link
                              key={i}
                              href={`/course/${encodeURIComponent(slot.course.code)}`}
                              className="block border border-border bg-bg px-3 py-2 transition-colors hover:border-accent"
                            >
                              <span className="font-num block text-[11px] uppercase tracking-wider text-text-muted">
                                {slot.course.code}
                              </span>
                              <span className="block text-sm font-medium leading-tight">{slot.course.title}</span>
                            </Link>
                          ) : (
                            <div
                              key={i}
                              className="border border-dashed border-border bg-bg px-3 py-2 text-sm italic text-text-muted"
                            >
                              {slot.electiveLabel}
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
