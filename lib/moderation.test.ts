import { describe, expect, it } from "vitest";
import { screenReview } from "./moderation";

describe("screenReview", () => {
  it("auto-publishes ordinary teaching feedback", () => {
    const result = screenReview(
      "The pacing was tough but the assignments were clear and office hours were genuinely useful.",
      ["Alex Bennett"],
    );
    expect(result.status).toBe("PUBLISHED");
    expect(result.reasons).toHaveLength(0);
  });

  it("holds a review containing profanity", () => {
    const result = screenReview("This course was absolute shit and a waste of time.", []);
    expect(result.status).toBe("PENDING");
    expect(result.reasons[0]).toMatch(/profanity/i);
  });

  it("doesn't false-positive on a word that merely contains a blocked substring", () => {
    // "class" contains "ass" but must not match as a whole word.
    const result = screenReview("This class had a reasonable workload and fair grading.", []);
    expect(result.status).toBe("PUBLISHED");
  });

  it("holds a review naming a professor alongside a misconduct trigger term", () => {
    const result = screenReview(
      "Alex Bennett was allegedly fired last year for being inappropriate with students.",
      ["Alex Bennett"],
    );
    expect(result.status).toBe("PENDING");
    expect(result.reasons[0]).toMatch(/flagged term/i);
  });

  it("does not hold a trigger term when no professor is named", () => {
    const result = screenReview("I heard a rumour the department got sued once.", []);
    expect(result.status).toBe("PUBLISHED");
  });
});
