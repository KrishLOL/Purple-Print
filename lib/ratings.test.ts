import { describe, expect, it, vi } from "vitest";
import {
  BAYESIAN_C,
  MIN_REVIEWS_FOR_RATING,
  bayesianAverage,
  booleanPercent,
  displayRating,
  hasEnoughReviews,
  meanToPercent,
  recomputeCourseAggregates,
  recomputeProfessorAggregates,
} from "./ratings";

describe("meanToPercent", () => {
  it("maps a mean of 1 (worst) to 0%", () => {
    expect(meanToPercent(1)).toBe(0);
  });

  it("maps a mean of 5 (best) to 100%", () => {
    expect(meanToPercent(5)).toBe(100);
  });

  it("maps a mean of 3 (middle) to 50%", () => {
    expect(meanToPercent(3)).toBe(50);
  });

  it("rounds to the nearest whole percent", () => {
    expect(meanToPercent(3.1)).toBe(53);
  });
});

describe("booleanPercent", () => {
  it("computes the percent of true values", () => {
    expect(booleanPercent(3, 4)).toBe(75);
  });

  it("returns 0 instead of NaN when total is 0", () => {
    expect(booleanPercent(0, 0)).toBe(0);
  });
});

describe("hasEnoughReviews / displayRating", () => {
  it(`requires at least ${MIN_REVIEWS_FOR_RATING} reviews`, () => {
    expect(hasEnoughReviews(MIN_REVIEWS_FOR_RATING - 1)).toBe(false);
    expect(hasEnoughReviews(MIN_REVIEWS_FOR_RATING)).toBe(true);
  });

  it("hides the value below the threshold", () => {
    expect(displayRating(97, 2)).toBeNull();
  });

  it("shows the value at/above the threshold", () => {
    expect(displayRating(97, 3)).toBe(97);
  });
});

describe("bayesianAverage", () => {
  it("equals the global mean when a course has no reviews", () => {
    expect(bayesianAverage({ sum: 0, n: 0, globalMean: 3.5 })).toBeCloseTo(3.5);
  });

  it("converges to the raw average as n grows relative to C", () => {
    const manyReviews = bayesianAverage({ sum: 3500, n: 1000, globalMean: 3.0 });
    expect(manyReviews).toBeCloseTo(3.5, 1);
  });

  it("stops a single perfect review from outranking a large, solid sample", () => {
    // One 5/5 review vs. forty reviews averaging 3.5/5, against a global mean of 3.0.
    const oneReview = bayesianAverage({ sum: 5, n: 1, globalMean: 3.0 });
    const fortyReviews = bayesianAverage({ sum: 140, n: 40, globalMean: 3.0 });

    // Naively, the single 5.0 average would win. Bayesian smoothing (C = 5)
    // pulls the 1-review course toward the global mean hard enough that the
    // 40-review course, sitting close to its true 3.5 average, comes out on top.
    expect(oneReview).toBeLessThan(5);
    expect(fortyReviews).toBeGreaterThan(oneReview);
    expect(BAYESIAN_C).toBe(5);
  });
});

function makeTx(reviews: unknown[]) {
  const update = vi.fn();
  return {
    tx: {
      review: { findMany: vi.fn().mockResolvedValue(reviews) },
      course: { update },
      professor: { update },
    },
    update,
  };
}

describe("recomputeCourseAggregates", () => {
  it("averages useful/easy as percents, liked as a percent, and workload as raw hours", async () => {
    const { tx, update } = makeTx([
      { useful: 5, easy: 3, liked: true, workloadHours: 10 },
      { useful: 3, easy: 3, liked: false, workloadHours: 6 },
      { useful: 4, easy: 3, liked: true, workloadHours: 8 },
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recomputeCourseAggregates(tx as any, "course-1");

    expect(update).toHaveBeenCalledWith({
      where: { id: "course-1" },
      data: {
        reviewCount: 3,
        avgUseful: meanToPercent(4), // (5+3+4)/3 = 4
        avgEasy: meanToPercent(3),
        avgLiked: booleanPercent(2, 3),
        avgWorkload: 8, // (10+6+8)/3
      },
    });
  });

  it("writes zeroed aggregates when a course has no published reviews", async () => {
    const { tx, update } = makeTx([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recomputeCourseAggregates(tx as any, "course-empty");

    expect(update).toHaveBeenCalledWith({
      where: { id: "course-empty" },
      data: { reviewCount: 0, avgUseful: 0, avgEasy: 0, avgLiked: 0, avgWorkload: 0 },
    });
  });
});

describe("recomputeProfessorAggregates", () => {
  it("ignores reviews with null professor-specific fields and averages the rest", async () => {
    const { tx, update } = makeTx([
      { clarity: 5, helpfulness: 5, wouldRetake: true },
      { clarity: 3, helpfulness: 3, wouldRetake: false },
      { clarity: null, helpfulness: null, wouldRetake: null },
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await recomputeProfessorAggregates(tx as any, "prof-1");

    expect(update).toHaveBeenCalledWith({
      where: { id: "prof-1" },
      data: {
        reviewCount: 3,
        avgClarity: meanToPercent(4),
        avgHelpfulness: meanToPercent(4),
        avgRetakePct: booleanPercent(1, 2),
        avgRating: Math.round((meanToPercent(4) + meanToPercent(4)) / 2),
      },
    });
  });
});
