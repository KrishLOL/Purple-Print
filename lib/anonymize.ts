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
