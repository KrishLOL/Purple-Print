import { prisma } from "@/lib/db";

/**
 * Fixed-window rate limiter backed by the shared Postgres database rather
 * than in-process memory -- a serverless deploy runs many isolated function
 * instances, so an in-memory counter would track each instance separately
 * and under-enforce the limit. The upsert below is a single atomic
 * statement (INSERT ... ON CONFLICT), so concurrent requests for the same
 * key across different instances still count correctly against one shared
 * total.
 *
 * Returns true if `key` has already made `maxRequests` within the current
 * `windowMs`-wide window.
 */
export async function isRateLimited(key: string, maxRequests: number, windowMs: number): Promise<boolean> {
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);

  const rows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimitBucket" AS b (key, "windowStart", count)
    VALUES (${key}, ${windowStart}, 1)
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN b."windowStart" = EXCLUDED."windowStart" THEN b.count + 1 ELSE 1 END,
      "windowStart" = EXCLUDED."windowStart"
    RETURNING count
  `;

  // Opportunistic cleanup so the table doesn't grow unbounded with one row
  // per distinct key ever seen -- no separate cron needed for a table this
  // cheap to sweep. Never blocks the rate-limit decision itself.
  if (Math.random() < 0.01) {
    const staleCutoff = new Date(Date.now() - Math.max(windowMs, 60 * 60 * 1000));
    prisma.rateLimitBucket.deleteMany({ where: { windowStart: { lt: staleCutoff } } }).catch(() => {});
  }

  const count = rows[0]?.count ?? 1;
  return count > maxRequests;
}
