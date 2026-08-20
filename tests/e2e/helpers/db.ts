import { Pool } from "pg";

/**
 * Playwright's test loader can't handle the generated Prisma client's
 * `import.meta.url` usage (it's ESM, Playwright's transform is CJS), so
 * test helpers talk to Postgres directly via `pg` instead of importing
 * `@/lib/db`. Keep this file's SQL in sync with the schema by hand.
 */
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function query<T = unknown>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await pool.query(sql, params);
  return result.rows as T[];
}

/** Mirrors lib/ratings.ts's meanToPercent, recomputed here to avoid importing the Prisma client. */
export async function recomputeCourseAggregates(courseId: string): Promise<void> {
  const [row] = await query<{
    count: string;
    avg_useful: string | null;
    avg_easy: string | null;
    avg_liked: string | null;
    avg_workload: string | null;
  }>(
    `SELECT
       COUNT(*) as count,
       AVG(useful) as avg_useful,
       AVG(easy) as avg_easy,
       AVG(CASE WHEN liked THEN 1.0 ELSE 0.0 END) as avg_liked,
       AVG("workloadHours") as avg_workload
     FROM "Review"
     WHERE "courseId" = $1 AND status = 'PUBLISHED'`,
    [courseId],
  );

  const count = Number(row.count);
  const toPercent = (mean: number | null) => (mean == null ? 0 : Math.round(((mean - 1) / 4) * 100));

  await query(
    `UPDATE "Course" SET "reviewCount" = $1, "avgUseful" = $2, "avgEasy" = $3, "avgLiked" = $4, "avgWorkload" = $5 WHERE id = $6`,
    [
      count,
      toPercent(row.avg_useful == null ? null : Number(row.avg_useful)),
      toPercent(row.avg_easy == null ? null : Number(row.avg_easy)),
      row.avg_liked == null ? 0 : Math.round(Number(row.avg_liked) * 100),
      row.avg_workload == null ? 0 : Number(row.avg_workload),
      courseId,
    ],
  );
}
