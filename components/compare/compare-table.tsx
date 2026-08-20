import Link from "next/link";
import type { CompareCourseRow, CompareProfessorRow } from "@/lib/compare/query";

function MetricRow({
  label,
  values,
  max,
  suffix = "%",
  decimals = 0,
}: {
  label: string;
  values: (number | null)[];
  max: number;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <tr className="border-t border-border">
      <th scope="row" className="p-3 text-left text-xs uppercase tracking-wider text-text-muted">
        {label}
      </th>
      {values.map((v, i) => {
        const display = v == null ? null : v.toFixed(decimals);
        return (
          <td key={i} className="p-3">
            {v == null || display == null ? (
              <span className="text-xs text-text-muted">Not enough ratings</span>
            ) : (
              <div>
                <div className="font-num mb-1 text-sm">
                  {display}
                  {suffix}
                </div>
                <div className="h-1.5 w-full bg-border" role="img" aria-label={`${label}: ${display}${suffix}`}>
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${max > 0 ? Math.min(100, (v / max) * 100) : 0}%` }}
                  />
                </div>
              </div>
            )}
          </td>
        );
      })}
    </tr>
  );
}

export function CourseCompareTable({ courses }: { courses: CompareCourseRow[] }) {
  const maxWorkload = Math.max(1, ...courses.map((c) => c.workload));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse">
        <thead>
          <tr>
            <th scope="col" className="p-3 text-left text-xs uppercase tracking-wider text-text-muted">
              &nbsp;
            </th>
            {courses.map((c) => (
              <th key={c.id} scope="col" className="p-3 text-left">
                <Link href={`/course/${encodeURIComponent(c.code)}`} className="hover:text-accent">
                  <p className="font-num text-xs uppercase tracking-wider text-text-muted">{c.code}</p>
                  <p className="text-sm font-semibold">{c.title}</p>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-border">
            <th scope="row" className="p-3 text-left text-xs uppercase tracking-wider text-text-muted">
              Reviews
            </th>
            {courses.map((c) => (
              <td key={c.id} className="font-num p-3 text-sm">
                {c.reviewCount}
              </td>
            ))}
          </tr>
          <MetricRow label="Useful" values={courses.map((c) => c.useful)} max={100} />
          <MetricRow label="Easy" values={courses.map((c) => c.easy)} max={100} />
          <MetricRow label="Liked" values={courses.map((c) => c.liked)} max={100} />
          <MetricRow
            label="Workload"
            values={courses.map((c) => c.workload)}
            max={maxWorkload}
            suffix=" hrs/wk"
            decimals={1}
          />
        </tbody>
      </table>
    </div>
  );
}

export function ProfessorCompareTable({ professors }: { professors: CompareProfessorRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse">
        <thead>
          <tr>
            <th scope="col" className="p-3 text-left text-xs uppercase tracking-wider text-text-muted">
              &nbsp;
            </th>
            {professors.map((p) => (
              <th key={p.id} scope="col" className="p-3 text-left">
                <Link href={`/professor/${p.slug}`} className="hover:text-accent">
                  <p className="text-sm font-semibold">
                    {p.firstName} {p.lastName}
                  </p>
                </Link>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-border">
            <th scope="row" className="p-3 text-left text-xs uppercase tracking-wider text-text-muted">
              Reviews
            </th>
            {professors.map((p) => (
              <td key={p.id} className="font-num p-3 text-sm">
                {p.reviewCount}
              </td>
            ))}
          </tr>
          <MetricRow label="Clarity" values={professors.map((p) => p.clarity)} max={100} />
          <MetricRow label="Helpfulness" values={professors.map((p) => p.helpfulness)} max={100} />
          <MetricRow label="Would retake" values={professors.map((p) => p.retake)} max={100} />
        </tbody>
      </table>
    </div>
  );
}
