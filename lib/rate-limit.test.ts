import "dotenv/config";
import { afterAll, describe, expect, it } from "vitest";
import { isRateLimited } from "./rate-limit";
import { prisma } from "./db";

// Hits the real dev database rather than mocking Prisma -- the whole point
// of the Postgres-backed rewrite is that concurrent callers (standing in
// for separate serverless instances) share one count instead of each
// tracking its own, which an in-memory mock couldn't meaningfully verify.
describe("isRateLimited", () => {
  const key = `test:rate-limit:${Date.now()}`;

  afterAll(async () => {
    await prisma.rateLimitBucket.deleteMany({ where: { key: { startsWith: key } } });
  });

  it("blocks once the limit is reached within a window, and persists the count", async () => {
    const results = [
      await isRateLimited(key, 3, 60_000),
      await isRateLimited(key, 3, 60_000),
      await isRateLimited(key, 3, 60_000),
      await isRateLimited(key, 3, 60_000),
    ];
    expect(results).toEqual([false, false, false, true]);

    const bucket = await prisma.rateLimitBucket.findUniqueOrThrow({ where: { key } });
    expect(bucket.count).toBe(4);
  });

  it("concurrent callers against the same key share one count", async () => {
    const concurrentKey = `${key}:concurrent`;
    const outcomes = await Promise.all(
      Array.from({ length: 10 }, () => isRateLimited(concurrentKey, 5, 60_000)),
    );
    // Exactly 5 of 10 simultaneous callers should be let through -- an
    // in-memory-per-instance limiter could let far more than 5 through if
    // instances didn't share state; one shared Postgres counter can't.
    expect(outcomes.filter((blocked) => !blocked)).toHaveLength(5);
  });

  it("a new window resets the count", async () => {
    const shortKey = `${key}:short-window`;
    expect(await isRateLimited(shortKey, 1, 200)).toBe(false);
    expect(await isRateLimited(shortKey, 1, 200)).toBe(true);
    await new Promise((r) => setTimeout(r, 250));
    expect(await isRateLimited(shortKey, 1, 200)).toBe(false);
  });
});
