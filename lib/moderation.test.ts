import { describe, expect, it } from "vitest";
import { findMentionedOtherProfessor, screenReview } from "./moderation";

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

  it("doesn't false-positive on a professor's short first name embedded in another word", () => {
    // "Tim" is contained in "sometimes" -- a bare .includes() check would
    // wrongly treat this as naming the professor.
    const result = screenReview(
      "The professor was allegedly fired last year, which sometimes came up in lecture.",
      ["Tim Newson"],
    );
    expect(result.status).toBe("PUBLISHED");
  });
});

describe("findMentionedOtherProfessor", () => {
  const professors = [
    { id: "p1", firstName: "Tim", lastName: "Newson" },
    { id: "p2", firstName: "Alex", lastName: "Buchel" },
  ];

  it("doesn't false-positive on a short first name embedded in another word", () => {
    // Reproduces the reported bug: reviewing Alex Buchel via "Other" while
    // the body says "sometimes", which contains "Tim" as a substring.
    const result = findMentionedOtherProfessor(
      "The pacing was fine and sometimes the lectures ran long.",
      professors,
      { excludeFullName: "Alex Buchel" },
    );
    expect(result).toBeNull();
  });

  it("does not warn about the professor the student just typed under Other", () => {
    const result = findMentionedOtherProfessor("Alex Buchel explained everything clearly.", professors, {
      excludeFullName: "Alex Buchel",
    });
    expect(result).toBeNull();
  });

  it("still warns about a genuinely different professor mentioned by name", () => {
    const result = findMentionedOtherProfessor("Tim Newson explained everything clearly.", professors, {
      excludeFullName: "Alex Buchel",
    });
    expect(result).toBe("Tim Newson");
  });

  it("excludes the selected professor by id", () => {
    const result = findMentionedOtherProfessor("Tim Newson explained everything clearly.", professors, {
      excludeId: "p1",
    });
    expect(result).toBeNull();
  });
});
