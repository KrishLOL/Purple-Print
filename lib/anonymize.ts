import { createHash } from "node:crypto";

/** Deterministic, non-reversible-in-practice stand-in for a user's email, for display/dedup only. */
export function hashEmail(email: string): string {
  return createHash("sha256").update(email.toLowerCase()).digest("hex").slice(0, 16);
}

export function emailDomain(email: string): string {
  return email.toLowerCase().split("@")[1] ?? "";
}

/**
 * Reviews must never show a name or email — only a self-declared discipline
 * and grad year, e.g. "Mechanical Eng., Class of '27".
 */
export function formatAuthorLabel(
  disciplineName: string | null | undefined,
  gradYear: number | null | undefined,
): string {
  const shortDiscipline = disciplineName
    ? disciplineName.replace(/ \(Common\)$/, "").replace(/Engineering$/, "Eng.")
    : null;

  if (!shortDiscipline && !gradYear) return "Western Engineering student";

  const yearSuffix = gradYear ? `'${String(gradYear).slice(-2)}` : null;

  if (!shortDiscipline) return `Class of ${yearSuffix}`;
  if (!yearSuffix) return shortDiscipline;
  return `${shortDiscipline}, Class of ${yearSuffix}`;
}
