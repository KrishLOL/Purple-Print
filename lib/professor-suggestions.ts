/**
 * A suggestion surfaces in /admin/moderation once its mentionCount reaches
 * this many distinct reviews on the same course -- chosen to match the
 * report-review AUTO_HIDE_THRESHOLD (components/review/report-action.ts),
 * so a single stray typo or joke name doesn't clutter the queue.
 */
export const SUGGESTION_QUEUE_THRESHOLD = 3;

const TITLE_PREFIX = /^(dr|prof|professor|mr|mrs|ms)\.?\s+/i;

/**
 * Folds a free-text professor name down to a de-duplication key: case and
 * whitespace differences and a leading title ("Dr.", "Professor", ...)
 * collapse to the same key. Deliberately not full fuzzy matching (no
 * typo-tolerance) -- that's a lot more failure-prone than it's worth here,
 * and this already covers the dominant real-world duplicates.
 */
export function normalizeProfessorName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(TITLE_PREFIX, "");
}

/** Best-effort split of a typed display name into first/last for a promotion form's defaults. */
export function splitDisplayName(displayName: string): { firstName: string; lastName: string } {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { firstName: "", lastName: parts[0] ?? "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts[parts.length - 1] };
}

export function slugifyProfessorName(firstName: string, lastName: string): string {
  const base = `${firstName} ${lastName}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
  return base || "professor";
}
